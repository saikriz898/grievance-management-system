const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect, authorize } = require('../middleware/auth');
const Grievance = require('../models/Grievance');
const User = require('../models/User');

// Secure path validation
const validatePath = (filePath) => {
  const resolved = path.resolve(filePath);
  const allowed = path.resolve(__dirname, '../uploads/');
  return resolved.startsWith(allowed);
};

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.resolve(__dirname, '../uploads/');
    if (!validatePath(uploadPath)) {
      return cb(new Error('Invalid upload path'));
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const sanitizedName = path.basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${sanitizedName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const sanitizedName = path.basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, '_');
    
    // Check for path traversal attempts
    if (sanitizedName.includes('..') || sanitizedName.includes('/') || sanitizedName.includes('\\')) {
      return cb(new Error('Invalid filename - path traversal detected'));
    }
    
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(sanitizedName).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname && sanitizedName.length > 0 && sanitizedName.length < 255) {
      file.originalname = sanitizedName;
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type or filename'));
    }
  }
});

// Add comment to grievance
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { text } = req.body;
    
    // Validate and sanitize input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }
    
    if (text.length > 1000) {
      return res.status(400).json({ success: false, message: 'Comment too long (max 1000 characters)' });
    }
    
    const sanitizedText = text.replace(/<[^>]*>/g, '').trim();
    const grievance = await Grievance.findById(req.params.id);
    
    if (!grievance) {
      return res.status(404).json({ success: false, message: 'Grievance not found' });
    }

    const comment = {
      message: sanitizedText,
      user: req.user._id,
      createdAt: new Date()
    };

    grievance.comments.push(comment);
    await grievance.save();
    
    await grievance.populate({
      path: 'comments.user',
      select: 'name role'
    });

    res.json({
      success: true,
      comment: grievance.comments[grievance.comments.length - 1]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get comments for grievance
router.get('/:id/comments', protect, async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id)
      .populate({
        path: 'comments.user',
        select: 'name role'
      });
    
    if (!grievance) {
      return res.status(404).json({ success: false, message: 'Grievance not found' });
    }

    res.json({
      success: true,
      comments: grievance.comments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Assign grievance to staff
router.put('/:id/assign', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { assignedTo } = req.body;
    
    const grievance = await Grievance.findByIdAndUpdate(
      req.params.id,
      { assignedTo, status: 'in_progress' },
      { new: true }
    ).populate('assignedTo', 'name role department');

    res.json({
      success: true,
      grievance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk status update
router.put('/bulk-status', protect, authorize('admin'), async (req, res) => {
  try {
    const { ids, status } = req.body;
    
    await Grievance.updateMany(
      { _id: { $in: ids } },
      { status, updatedAt: new Date() }
    );

    res.json({
      success: true,
      message: `Updated ${ids.length} grievances`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk export
router.post('/bulk-export', protect, authorize('admin'), async (req, res) => {
  try {
    const { ids, format } = req.body;
    
    const grievances = await Grievance.find({ _id: { $in: ids } })
      .populate('submittedBy', 'name phone')
      .populate('assignedTo', 'name');

    if (format === 'csv') {
      const csv = grievances.map(g => 
        `${g.trackingId},${g.title},${g.status},${g.priority},${g.submittedBy.name},${g.createdAt}`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=grievances.csv');
      res.send(`ID,Title,Status,Priority,Submitted By,Date\n${csv}`);
    } else {
      // PDF export would require additional library like puppeteer
      res.json({ success: false, message: 'PDF export not implemented' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk delete
router.delete('/bulk', protect, authorize('admin'), async (req, res) => {
  try {
    const { ids } = req.body;
    
    await Grievance.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: `Deleted ${ids.length} grievances`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get staff for assignment
router.get('/staff', protect, authorize('admin'), async (req, res) => {
  try {
    const staff = await User.find({ 
      role: { $in: ['staff', 'faculty', 'admin'] } 
    }).select('name role department');

    res.json({
      success: true,
      staff
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;