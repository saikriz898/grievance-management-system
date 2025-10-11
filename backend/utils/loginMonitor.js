const LoginSession = require('../models/LoginSession');
const Logger = require('./logger');

class LoginMonitor {
  static parseUserAgent(userAgent) {
    const device = {
      type: 'Unknown',
      browser: 'Unknown',
      os: 'Unknown'
    };

    if (userAgent) {
      // Detect device type
      if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
        device.type = 'Mobile';
      } else if (/Tablet|iPad/.test(userAgent)) {
        device.type = 'Tablet';
      } else {
        device.type = 'Desktop';
      }

      // Detect browser
      if (/Chrome/.test(userAgent)) device.browser = 'Chrome';
      else if (/Firefox/.test(userAgent)) device.browser = 'Firefox';
      else if (/Safari/.test(userAgent)) device.browser = 'Safari';
      else if (/Edge/.test(userAgent)) device.browser = 'Edge';

      // Detect OS
      if (/Windows/.test(userAgent)) device.os = 'Windows';
      else if (/Mac/.test(userAgent)) device.os = 'macOS';
      else if (/Linux/.test(userAgent)) device.os = 'Linux';
      else if (/Android/.test(userAgent)) device.os = 'Android';
      else if (/iOS/.test(userAgent)) device.os = 'iOS';
    }

    return device;
  }

  static async recordLogin(userId, req, success = true, failureReason = null) {
    try {
      const ip = req.ip || req.connection.remoteAddress || 'Unknown';
      const userAgent = req.get('User-Agent') || '';
      const device = this.parseUserAgent(userAgent);

      const sessionData = {
        userId,
        ip,
        userAgent,
        device,
        loginType: success ? 'success' : 'failed',
        isActive: success
      };

      if (!success && failureReason) {
        sessionData.failureReason = failureReason;
      }

      await LoginSession.create(sessionData);
    } catch (error) {
      console.error('Login monitoring error:', error);
    }
  }

  static async getUserLoginHistory(userId, limit = 20) {
    try {
      return await LoginSession.find({ userId })
        .sort({ loginTime: -1 })
        .limit(limit)
        .lean();
    } catch (error) {
      console.error('Get login history error:', error);
      return [];
    }
  }

  static async getActiveUserSessions(userId) {
    try {
      return await LoginSession.find({ userId, isActive: true })
        .sort({ loginTime: -1 })
        .lean();
    } catch (error) {
      console.error('Get active sessions error:', error);
      return [];
    }
  }

  static async getAllLoginActivity(limit = 50) {
    try {
      return await LoginSession.find()
        .populate('userId', 'name idNumber role')
        .sort({ loginTime: -1 })
        .limit(limit)
        .lean();
    } catch (error) {
      console.error('Get all login activity error:', error);
      return [];
    }
  }

  static async getFailedLoginAttempts(hours = 24) {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000);
      return await LoginSession.find({
        loginType: 'failed',
        loginTime: { $gte: since }
      })
        .populate('userId', 'name idNumber')
        .sort({ loginTime: -1 })
        .lean();
    } catch (error) {
      console.error('Get failed logins error:', error);
      return [];
    }
  }

  static async logoutUser(userId, sessionId = null) {
    try {
      const filter = { userId, isActive: true };
      if (sessionId) filter._id = sessionId;

      await LoginSession.updateMany(filter, {
        logoutTime: new Date(),
        isActive: false
      });
    } catch (error) {
      console.error('Logout user error:', error);
    }
  }
}

module.exports = LoginMonitor;