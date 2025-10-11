const mongoose = require('mongoose');

const loginSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ip: String,
  userAgent: String,
  location: {
    country: String,
    city: String,
    region: String
  },
  device: {
    type: {
      type: String
    },
    browser: String,
    os: String
  },
  loginTime: {
    type: Date,
    default: Date.now
  },
  logoutTime: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  loginType: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  },
  failureReason: String
}, {
  timestamps: true
});

loginSessionSchema.index({ userId: 1, loginTime: -1 });
loginSessionSchema.index({ ip: 1 });
loginSessionSchema.index({ isActive: 1 });

module.exports = mongoose.model('LoginSession', loginSessionSchema);