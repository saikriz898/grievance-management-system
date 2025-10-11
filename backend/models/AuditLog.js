const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'ASSIGN', 'ESCALATE', 'EXPORT', 'LOGIN', 'LOGOUT']
  },
  resource: {
    type: String,
    required: true // grievance, user, settings, etc.
  },
  resourceId: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  changes: {
    type: mongoose.Schema.Types.Mixed // Store what changed
  },
  metadata: {
    ip: String,
    userAgent: String,
    timestamp: { type: Date, default: Date.now }
  },
  confidential: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ resource: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);