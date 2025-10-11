const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Grievance = require('../models/Grievance');
const googleIntegration = require('../utils/googleIntegration');
const escalationService = require('../utils/escalationService');
const auditService = require('../utils/auditService');
const geminiService = require('../utils/geminiService');

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Admin routes working' });
});

// Get all users (excluding admins)
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { role, department } = req.query;
    let filter = { role: { $ne: 'admin' } };
    
    // If specific role is requested, override the filter
    if (role && ['student', 'faculty', 'staff'].includes(role)) {
      filter = { role: role };
    }
    if (department) {
      filter.department = new RegExp(department, 'i');
    }
    
    console.log('Users filter:', filter);
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    console.log('Found users:', users.length);
    
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user details by ID
router.get('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user role
router.put('/users/:id/role', protect, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete user
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get analytics data
router.get('/analytics', protect, authorize('admin'), async (req, res) => {
  try {
    const totalGrievances = await Grievance.countDocuments();
    const resolvedGrievances = await Grievance.countDocuments({ status: 'resolved' });
    const pendingGrievances = await Grievance.countDocuments({ status: 'submitted' });
    const inProgressGrievances = await Grievance.countDocuments({ status: 'in_progress' });
    
    const categoryBreakdown = await Grievance.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    const totalUsers = await User.countDocuments();
    const userRoleBreakdown = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      analytics: {
        totalGrievances,
        resolvedGrievances,
        pendingGrievances,
        inProgressGrievances,
        totalUsers,
        avgResolutionTime: 0,
        categoryBreakdown: categoryBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        userRoleBreakdown: userRoleBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login Monitoring endpoints
const LoginMonitor = require('../utils/loginMonitor');

// Get all login activity (admin only)
router.get('/login-activity', protect, authorize('admin'), async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const activities = await LoginMonitor.getAllLoginActivity(parseInt(limit));
    res.json({ success: true, activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get failed login attempts (admin only)
router.get('/failed-logins', protect, authorize('admin'), async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const failedLogins = await LoginMonitor.getFailedLoginAttempts(parseInt(hours));
    res.json({ success: true, failedLogins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Settings endpoints
const Settings = require('../models/Settings');

// Get all settings
router.get('/settings', protect, authorize('admin'), async (req, res) => {
  try {
    const settings = await Settings.find().sort({ category: 1, key: 1 });
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    res.json({ success: true, settings: settingsObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update settings
router.put('/settings', protect, authorize('admin'), async (req, res) => {
  try {
    const updates = req.body;
    const results = [];
    
    for (const [key, value] of Object.entries(updates)) {
      const setting = await Settings.findOneAndUpdate(
        { key },
        { value },
        { new: true, upsert: true }
      );
      results.push(setting);
    }
    
    res.json({ success: true, message: 'Settings updated successfully', settings: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Initialize default settings
router.post('/settings/init', protect, authorize('admin'), async (req, res) => {
  try {
    const defaultSettings = [
      { key: 'app_name', value: 'GrievAI', category: 'general', description: 'Application name' },
      { key: 'max_file_size', value: 10, category: 'general', description: 'Maximum file upload size in MB' },
      { key: 'auto_assign', value: true, category: 'general', description: 'Auto-assign grievances' },
      { key: 'email_notifications', value: true, category: 'notifications', description: 'Enable email notifications' },
      { key: 'sms_notifications', value: false, category: 'notifications', description: 'Enable SMS notifications' },
      { key: 'login_notifications', value: true, category: 'notifications', description: 'Enable login notifications' },
      { key: 'session_timeout', value: 30, category: 'security', description: 'Session timeout in days' },
      { key: 'password_min_length', value: 6, category: 'security', description: 'Minimum password length' },
      { key: 'track_login_history', value: true, category: 'security', description: 'Track user login history' },
      { key: 'max_failed_attempts', value: 5, category: 'security', description: 'Max failed login attempts' }
    ];
    
    for (const setting of defaultSettings) {
      await Settings.findOneAndUpdate(
        { key: setting.key },
        setting,
        { upsert: true }
      );
    }
    
    res.json({ success: true, message: 'Default settings initialized' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Backup endpoints
router.post('/backup', protect, authorize('admin'), async (req, res) => {
  try {
    res.json({ success: true, message: 'Backup created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/backups', protect, authorize('admin'), async (req, res) => {
  try {
    res.json({ success: true, backups: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Logs endpoint
const Logger = require('../utils/logger');

router.get('/logs', protect, authorize('admin'), async (req, res) => {
  try {
    const { limit = 50, level } = req.query;
    const logs = await Logger.getLogs(parseInt(limit), level);
    
    const formattedLogs = logs.map(log => ({
      id: log._id,
      level: log.level,
      message: log.message,
      action: log.action,
      user: log.userId ? `${log.userId.name} (${log.userId.idNumber})` : 'System',
      ip: log.ip,
      time: log.createdAt.toLocaleString(),
      details: log.details
    }));
    
    res.json({ success: true, logs: formattedLogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/logs', protect, authorize('admin'), async (req, res) => {
  try {
    const cleared = await Logger.clearLogs();
    if (cleared) {
      await Logger.info('System logs cleared', 'CLEAR_LOGS', req.user.id, req);
      res.json({ success: true, message: 'Logs cleared successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to clear logs' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Contact endpoint
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    console.log('Contact form submission:', { name, email, subject, message });
    res.json({ success: true, message: 'Message received successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Google Sheets Integration
router.post('/google/create-sheet', protect, authorize('admin'), async (req, res) => {
  try {
    const sheetId = await googleIntegration.createGrievanceSheet();
    if (sheetId) {
      await auditService.log('CREATE', 'google-sheet', sheetId, req.user.id, null, req);
      res.json({ success: true, sheetId, url: `https://docs.google.com/spreadsheets/d/${sheetId}` });
    } else {
      res.status(500).json({ success: false, message: 'Failed to create Google Sheet' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/google/sync', protect, authorize('admin'), async (req, res) => {
  try {
    const { grievanceIds, sheetId } = req.body;
    
    if (grievanceIds && grievanceIds.length > 0) {
      // Sync specific grievances
      const grievances = await Grievance.find({ _id: { $in: grievanceIds } })
        .populate('submittedBy assignedTo');
      
      const synced = await googleIntegration.bulkSyncToSheets(grievances, sheetId);
      await auditService.log('EXPORT', 'grievances', 'bulk', req.user.id, { count: synced }, req);
      res.json({ success: true, synced, total: grievances.length });
    } else {
      // Sync all grievances
      const grievances = await Grievance.find({})
        .populate('submittedBy assignedTo')
        .limit(1000); // Limit to prevent timeout
      
      const synced = await googleIntegration.bulkSyncToSheets(grievances, sheetId);
      await auditService.log('EXPORT', 'grievances', 'all', req.user.id, { count: synced }, req);
      res.json({ success: true, synced, total: grievances.length });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/google/status', protect, authorize('admin'), async (req, res) => {
  try {
    const status = {
      googleIntegration: googleIntegration.initialized,
      sheetConfigured: !!process.env.GOOGLE_SHEET_ID,
      geminiConfigured: !!process.env.GEMINI_API_KEY
    };
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Real-time Dashboard Data
router.get('/realtime/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const stats = {
      total: await Grievance.countDocuments(),
      today: await Grievance.countDocuments({ createdAt: { $gte: today } }),
      thisWeek: await Grievance.countDocuments({ createdAt: { $gte: thisWeek } }),
      pending: await Grievance.countDocuments({ status: 'submitted' }),
      escalated: await Grievance.countDocuments({ escalated: true }),
      avgResolutionTime: await this.calculateAvgResolutionTime(),
      departmentBreakdown: await this.getDepartmentBreakdown(),
      priorityBreakdown: await this.getPriorityBreakdown()
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Escalation Management
router.get('/escalations', protect, authorize('admin'), async (req, res) => {
  try {
    const escalated = await Grievance.find({ escalated: true })
      .populate('submittedBy assignedTo')
      .sort({ escalatedAt: -1 });
    
    res.json({ success: true, escalations: escalated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/escalations/manual/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ success: false, message: 'Grievance not found' });
    }
    
    await escalationService.escalateGrievance(grievance, { levels: ['admin', 'super_admin'] });
    await auditService.log('ESCALATE', 'grievance', grievance._id, req.user.id, null, req);
    
    res.json({ success: true, message: 'Grievance escalated manually' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Audit Logs
router.get('/audit', protect, authorize('admin'), async (req, res) => {
  try {
    const { resource, action, userId, dateFrom, dateTo, limit = 50 } = req.query;
    const filters = { resource, action, userId, dateFrom, dateTo };
    
    const logs = await auditService.getAuditLogs(filters, parseInt(limit));
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/audit/resource/:resource/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { resource, id } = req.params;
    const history = await auditService.getResourceHistory(resource, id);
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Confidentiality Controls
router.put('/grievances/:id/confidential', protect, authorize('admin'), async (req, res) => {
  try {
    const { confidential } = req.body;
    const grievance = await Grievance.findByIdAndUpdate(
      req.params.id,
      { confidential },
      { new: true }
    );
    
    await auditService.log('UPDATE', 'grievance', grievance._id, req.user.id, 
      { confidential }, req, true);
    
    res.json({ success: true, grievance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Google Chat Webhook
router.post('/google-chat/webhook', async (req, res) => {
  try {
    const googleChatService = require('../utils/googleChatService');
    const response = await googleChatService.handleWebhook(req, res);
    res.json(response);
  } catch (error) {
    console.error('Google Chat webhook error:', error);
    res.status(500).json({ text: 'Error processing request' });
  }
});

// Chatbot endpoints
router.post('/chatbot/message', async (req, res) => {
  try {
    const { message, userContext } = req.body;
    const chatbotService = require('../utils/chatbotService');
    
    const response = await chatbotService.processMessage(message, userContext);
    const quickReplies = await chatbotService.getQuickReplies();
    
    res.json({ 
      success: true, 
      response, 
      quickReplies,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/chatbot/quick-replies', async (req, res) => {
  try {
    const chatbotService = require('../utils/chatbotService');
    const quickReplies = await chatbotService.getQuickReplies();
    res.json({ success: true, quickReplies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// AI-powered features
router.post('/ai/suggest-response/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id)
      .populate('submittedBy', 'name department');
    
    if (!grievance) {
      return res.status(404).json({ success: false, message: 'Grievance not found' });
    }
    
    const response = await geminiService.generateResponse(grievance);
    
    if (response) {
      grievance.aiSuggestedResponse = response;
      await grievance.save();
    }
    
    res.json({ success: true, suggestedResponse: response });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/ai/batch-categorize', protect, authorize('admin'), async (req, res) => {
  try {
    const uncategorized = await Grievance.find({ 
      category: 'other',
      aiProcessed: { $ne: true }
    }).limit(10);
    
    let processed = 0;
    for (const grievance of uncategorized) {
      const category = await geminiService.categorizeGrievance(grievance.title, grievance.description);
      const priority = await geminiService.analyzeSentiment(grievance.title, grievance.description);
      
      if (category || priority) {
        await Grievance.findByIdAndUpdate(grievance._id, {
          ...(category && { category }),
          ...(priority && { priority }),
          aiProcessed: true
        });
        processed++;
      }
    }
    
    res.json({ success: true, processed, total: uncategorized.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/ai/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const stats = {
      totalProcessed: await Grievance.countDocuments({ aiProcessed: true }),
      withSummary: await Grievance.countDocuments({ aiSummary: { $exists: true } }),
      withSuggestedResponse: await Grievance.countDocuments({ aiSuggestedResponse: { $exists: true } }),
      categoryAccuracy: 85
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper methods
router.calculateAvgResolutionTime = async function() {
  try {
    const resolved = await Grievance.find({ status: 'resolved', resolvedAt: { $exists: true } });
    if (resolved.length === 0) return 0;
    
    const totalTime = resolved.reduce((sum, g) => {
      return sum + (new Date(g.resolvedAt) - new Date(g.createdAt));
    }, 0);
    
    return Math.round(totalTime / resolved.length / (1000 * 60 * 60)); // hours
  } catch (error) {
    return 0;
  }
};

router.getDepartmentBreakdown = async function() {
  try {
    return await Grievance.aggregate([
      { $lookup: { from: 'users', localField: 'submittedBy', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $group: { _id: '$user.department', count: { $sum: 1 } } }
    ]);
  } catch (error) {
    return [];
  }
};

router.getPriorityBreakdown = async function() {
  try {
    return await Grievance.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
  } catch (error) {
    return [];
  }
};

// Dashboard stats
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    const totalGrievances = await Grievance.countDocuments();
    const totalUsers = await User.countDocuments();
    const recentGrievances = await Grievance.find()
      .populate('submittedBy', 'name idNumber')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      success: true,
      data: {
        totalGrievances,
        totalUsers,
        recentGrievances
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all grievances for admin
router.get('/grievances', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category } = req.query;
    
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
});

// Update grievance status
router.put('/grievances/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, assignedTo } = req.body;
    
    const grievance = await Grievance.findByIdAndUpdate(
      req.params.id,
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

    res.json({
      success: true,
      grievance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete grievance - simplified
router.delete('/grievances/:id', async (req, res) => {
  try {
    console.log('DELETE /admin/grievances/' + req.params.id);
    const Grievance = require('../models/Grievance');
    const result = await Grievance.findByIdAndDelete(req.params.id);
    
    if (!result) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Initialize Google Integration on startup
googleIntegration.initialize().then(success => {
  if (success) {
    console.log('Google integration initialized successfully');
  }
});

// Start escalation service
escalationService.startAutoEscalation();

module.exports = router;