const express = require('express');
const { grievanceValidation, handleValidationErrors } = require('../middleware/validation');
const {
  submitGrievance,
  getMyGrievances,
  trackGrievance,
  addComment,
  getAllGrievances,
  updateGrievanceStatus,
  getGrievanceById,
  deleteGrievance
} = require('../controllers/grievanceController');
const Grievance = require('../models/Grievance');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Specific routes first
router.get('/my', protect, getMyGrievances);
router.get('/track/:trackingId', trackGrievance);
router.post('/:id/comments', protect, addComment);
router.put('/:id/status', protect, authorize('admin'), updateGrievanceStatus);
router.delete('/:id', protect, authorize('admin'), deleteGrievance);
router.get('/:id', protect, getGrievanceById);

// General routes
router.post('/', protect, (req, res, next) => {
  const upload = req.app.get('upload');
  upload.array('attachments', 5)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, grievanceValidation, handleValidationErrors, submitGrievance);

// Admin routes
router.get('/', protect, authorize('admin'), getAllGrievances);

module.exports = router;