const Grievance = require('../models/Grievance');
const { validationResult } = require('express-validator');
const { sendGrievanceNotification } = require('../utils/smsService');
const Logger = require('../utils/logger');
const auditService = require('../utils/auditService');
const googleIntegration = require('../utils/googleIntegration');
const geminiService = require('../utils/geminiService');
const freeNaturalLanguage = require('../utils/freeNaturalLanguage');
const gmailService = require('../utils/gmailService');
// const naturalLanguageService = require('../utils/naturalLanguageService');
// const googleChatService = require('../utils/googleChatService');

const submitGrievance = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    let { title, description, category, priority } = req.body;
    
    // AI Analysis using Gemini (with free NL fallback)
    let nlAnalysis = { suggestedCategory: 'other', suggestedPriority: 'medium', sentiment: { score: 0, magnitude: 0.5, label: 'neutral' } };
    
    if (geminiService.initialized) {
      // Use Gemini for all AI processing
      const moderation = await geminiService.moderateContent(`${title} ${description}`);
      if (!moderation.safe) {
        return res.status(400).json({ 
          success: false, 
          message: `Content flagged: ${moderation.reason}` 
        });
      }
      
      // Use Gemini for categorization
      if (!category || category === 'other') {
        const aiCategory = await geminiService.categorizeGrievance(title, description);
        if (aiCategory) category = aiCategory;
      }
      
      // Use Gemini for priority detection
      if (!priority || priority === 'medium') {
        const aiPriority = await geminiService.analyzeSentiment(title, description);
        if (aiPriority) priority = aiPriority;
      }
      
      nlAnalysis = {
        suggestedCategory: category,
        suggestedPriority: priority,
        sentiment: { score: 0, magnitude: 0.5, label: 'neutral' },
        aiProcessed: true
      };
    } else {
      // Fallback to free NL service
      nlAnalysis = freeNaturalLanguage.analyzeGrievance(`${title} ${description}`);
      if (!category || category === 'other') {
        category = nlAnalysis.suggestedCategory || 'other';
      }
      if (!priority || priority === 'medium') {
        priority = nlAnalysis.suggestedPriority || 'medium';
      }
    }

    // Generate tracking ID
    const year = new Date().getFullYear();
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const trackingId = `GRV-${year}-${randomNum}`;

    // Handle file attachments
    const attachments = req.files ? req.files.map(file => ({
      filename: file.originalname,
      path: file.path || `memory-${Date.now()}`, // Use memory path in production
      size: file.size,
      mimetype: file.mimetype,
      buffer: file.buffer // Store buffer for memory storage
    })) : [];

    // Generate AI summary for long descriptions
    const summary = description.length > 500 ? 
      await geminiService.summarizeGrievance(description) : null;
    
    const grievance = await Grievance.create({
      trackingId,
      title,
      description,
      category,
      priority,
      attachments,
      submittedBy: req.user.id,
      aiSummary: summary,
      aiProcessed: geminiService.initialized,
      nlAnalysis: nlAnalysis,
      sentimentScore: nlAnalysis.sentiment.score,
      sentimentLabel: nlAnalysis.sentiment.label
    });

    await grievance.populate('submittedBy', 'name phone idNumber');

    await Logger.success(`New grievance submitted: ${trackingId} by ${grievance.submittedBy.name}`, 'GRIEVANCE_SUBMIT', req.user.id, req, { category, priority });
    await auditService.log('CREATE', 'grievance', grievance._id, req.user.id, { title, category, priority }, req);
    
    // Auto-sync to Google Sheets if enabled
    try {
      await googleIntegration.syncToSheets(grievance);
      grievance.syncedToSheets = true;
      await grievance.save();
    } catch (error) {
      console.log('Google Sheets sync failed:', error.message);
    }

    // Send notifications
    try {
      await sendGrievanceNotification(
        grievance.submittedBy.phone,
        grievance.trackingId,
        'submitted'
      );
    } catch (smsError) {
      console.log('SMS notification failed:', smsError.message);
    }

    // Send email notification
    try {
      if (grievance.submittedBy.email) {
        await gmailService.sendGrievanceNotification(grievance, grievance.submittedBy, 'submitted');
      }
    } catch (emailError) {
      console.log('Email notification failed:', emailError.message);
    }

    res.status(201).json({
      success: true,
      grievance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyGrievances = async (req, res) => {
  try {
    const grievances = await Grievance.find({ submittedBy: req.user.id })
      .populate('submittedBy', 'name phone idNumber')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: grievances.length,
      grievances
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const trackGrievance = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const { email } = req.query; // Optional email for tracking notification

    const grievance = await Grievance.findOne({ trackingId })
      .populate('submittedBy', 'name phone idNumber email')
      .populate('assignedTo', 'name')
      .populate({
        path: 'comments.user',
        select: 'name'
      });

    if (!grievance) {
      return res.status(404).json({ 
        success: false, 
        message: 'Grievance not found' 
      });
    }

    // Send tracking notification email if email provided
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      try {
        await gmailService.sendTrackingNotification(email, trackingId, grievance);
      } catch (emailError) {
        console.log('Tracking email notification failed:', emailError.message);
      }
    }

    res.json({
      success: true,
      grievance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const grievance = await Grievance.findById(id);

    if (!grievance) {
      return res.status(404).json({ 
        success: false, 
        message: 'Grievance not found' 
      });
    }

    grievance.comments.push({
      user: req.user.id,
      message: comment,
      createdAt: new Date()
    });

    await grievance.save();
    await grievance.populate({
      path: 'comments.user',
      select: 'name'
    });

    res.json({
      success: true,
      grievance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllGrievances = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const grievances = await Grievance.find(filter)
      .populate('submittedBy', 'name phone idNumber department')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Grievance.countDocuments(filter);

    res.json({
      success: true,
      count: grievances.length,
      total,
      grievances
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getGrievanceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const grievance = await Grievance.findById(id)
      .populate('submittedBy', 'name phone idNumber department')
      .populate('assignedTo', 'name')
      .populate({
        path: 'comments.user',
        select: 'name'
      });

    if (!grievance) {
      return res.status(404).json({ 
        success: false, 
        message: 'Grievance not found' 
      });
    }

    // Check if user can access this grievance
    if (req.user.role !== 'admin' && grievance.submittedBy._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    res.json({
      success: true,
      grievance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateGrievanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo } = req.body;

    const grievance = await Grievance.findByIdAndUpdate(
      id,
      { status, assignedTo },
      { new: true, runValidators: true }
    ).populate('submittedBy', 'name phone')
     .populate('assignedTo', 'name');

    if (!grievance) {
      return res.status(404).json({ 
        success: false, 
        message: 'Grievance not found' 
      });
    }

    const oldStatus = grievance.status;
    await Logger.info(`Grievance status updated: ${grievance.trackingId} to ${status}`, 'GRIEVANCE_STATUS_UPDATE', req.user.id, req, { oldStatus, newStatus: status });
    await auditService.log('UPDATE', 'grievance', grievance._id, req.user.id, { status: { from: oldStatus, to: status }, assignedTo }, req);
    
    // Mark as resolved if status is resolved
    if (status === 'resolved' && oldStatus !== 'resolved') {
      grievance.resolvedAt = new Date();
      await grievance.save();
    }
    
    // Send status update email
    try {
      if (grievance.submittedBy?.email) {
        await gmailService.sendGrievanceNotification(grievance, grievance.submittedBy, 'updated');
      }
    } catch (emailError) {
      console.log('Status update email failed:', emailError.message);
    }

    // Send SMS notification to user's phone about status update (optional)
    try {
      await sendGrievanceNotification(
        grievance.submittedBy.phone,
        grievance.trackingId,
        status
      );
    } catch (smsError) {
      console.log('SMS notification failed:', smsError.message);
    }

    // Send Google Chat notification if chatSpace is available
    try {
      if (grievance.chatSpace) {
        const googleChatService = require('../utils/googleChatService');
        await googleChatService.notifyGrievanceUpdate(grievance.chatSpace, grievance, status);
      }
    } catch (chatError) {
      console.log('Google Chat notification failed:', chatError.message);
    }

    res.json({
      success: true,
      grievance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteGrievance = async (req, res) => {
  try {
    console.log('DELETE request for ID:', req.params.id);
    const grievance = await Grievance.findByIdAndDelete(req.params.id);
    
    if (!grievance) {
      console.log('Grievance not found');
      return res.status(404).json({ 
        success: false, 
        message: 'Grievance not found' 
      });
    }

    await Logger.warning(`Grievance deleted: ${grievance.trackingId}`, 'GRIEVANCE_DELETE', req.user?.id, req, { title: grievance.title });
    await auditService.log('DELETE', 'grievance', grievance._id, req.user?.id, { title: grievance.title, trackingId: grievance.trackingId }, req);
    
    console.log('Grievance deleted successfully');
    res.json({
      success: true,
      message: 'Grievance deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  submitGrievance,
  getMyGrievances,
  trackGrievance,
  addComment,
  getAllGrievances,
  updateGrievanceStatus,
  getGrievanceById,
  deleteGrievance
};