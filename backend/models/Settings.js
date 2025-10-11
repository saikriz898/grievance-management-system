const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['general', 'notifications', 'security', 'email', 'sms'],
    default: 'general'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);