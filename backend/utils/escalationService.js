const Grievance = require('../models/Grievance');
const User = require('../models/User');
const googleIntegration = require('./googleIntegration');
const Logger = require('./logger');

class EscalationService {
  constructor() {
    this.escalationRules = {
      high: { hours: 24, levels: ['admin', 'super_admin'] },
      urgent: { hours: 4, levels: ['admin', 'super_admin'] },
      medium: { hours: 72, levels: ['admin'] },
      low: { hours: 168, levels: ['admin'] }
    };
  }

  async checkEscalations() {
    try {
      const now = new Date();
      const grievances = await Grievance.find({
        status: { $in: ['submitted', 'in_progress'] }
      }).populate('submittedBy assignedTo');

      for (const grievance of grievances) {
        await this.processEscalation(grievance, now);
      }
    } catch (error) {
      console.error('Escalation check failed:', error);
    }
  }

  async processEscalation(grievance, now) {
    const rule = this.escalationRules[grievance.priority] || this.escalationRules.medium;
    const hoursSinceCreated = (now - new Date(grievance.createdAt)) / (1000 * 60 * 60);

    if (hoursSinceCreated > rule.hours && !grievance.escalated) {
      await this.escalateGrievance(grievance, rule);
    }
  }

  async escalateGrievance(grievance, rule) {
    try {
      // Mark as escalated
      grievance.escalated = true;
      grievance.escalatedAt = new Date();
      await grievance.save();

      // Find admins to notify
      const admins = await User.find({ role: { $in: rule.levels } });
      
      // Send notifications
      for (const admin of admins) {
        await this.sendEscalationNotification(admin, grievance);
      }

      // Log escalation
      await Logger.warning(
        `Grievance escalated: ${grievance.trackingId}`,
        'ESCALATION',
        null,
        null,
        { priority: grievance.priority, hoursSinceCreated: Math.floor((new Date() - new Date(grievance.createdAt)) / (1000 * 60 * 60)) }
      );

      return true;
    } catch (error) {
      console.error('Escalation failed:', error);
      return false;
    }
  }

  async sendEscalationNotification(admin, grievance) {
    if (admin.email) {
      await googleIntegration.sendEscalationEmail(admin.email, grievance);
    }
  }

  startAutoEscalation() {
    // Check every hour
    setInterval(() => {
      this.checkEscalations();
    }, 60 * 60 * 1000);
    
    console.log('Auto-escalation service started');
  }
}

module.exports = new EscalationService();