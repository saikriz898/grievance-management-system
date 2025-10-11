const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema({
  trackingId: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['academic', 'administrative', 'infrastructure', 'harassment', 'technical', 'other']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['submitted', 'in_progress', 'resolved', 'closed'],
    default: 'submitted'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimetype: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  escalated: {
    type: Boolean,
    default: false
  },
  escalatedAt: Date,
  dueDate: Date,
  tags: [String],
  confidential: {
    type: Boolean,
    default: false
  },
  resolvedAt: Date,
  syncedToSheets: {
    type: Boolean,
    default: false
  },
  nlAnalysis: {
    type: mongoose.Schema.Types.Mixed
  },
  sentimentScore: {
    type: Number,
    default: 0
  },
  sentimentLabel: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    default: 'neutral'
  },
  googleChatSpace: String,
  chatSpace: String, // For Google Chat notifications
  aiSummary: String,
  aiProcessed: {
    type: Boolean,
    default: false
  },
  aiSuggestedResponse: String
}, {
  timestamps: true
});



module.exports = mongoose.model('Grievance', grievanceSchema);