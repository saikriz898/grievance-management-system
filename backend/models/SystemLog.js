const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['info', 'warning', 'error', 'success'],
    default: 'info'
  },
  message: {
    type: String,
    required: true
  },
  action: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ip: String,
  userAgent: String,
  details: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

systemLogSchema.index({ createdAt: -1 });
systemLogSchema.index({ level: 1 });

module.exports = mongoose.model('SystemLog', systemLogSchema);