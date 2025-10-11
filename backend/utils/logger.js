const SystemLog = require('../models/SystemLog');

class Logger {
  static async log(level, message, action = null, userId = null, req = null, details = null) {
    try {
      const logData = {
        level,
        message,
        action,
        userId,
        details
      };

      if (req) {
        logData.ip = req.ip || req.connection.remoteAddress;
        logData.userAgent = req.get('User-Agent');
      }

      await SystemLog.create(logData);
    } catch (error) {
      console.error('Logging error:', error);
    }
  }

  static async info(message, action, userId, req, details) {
    return this.log('info', message, action, userId, req, details);
  }

  static async success(message, action, userId, req, details) {
    return this.log('success', message, action, userId, req, details);
  }

  static async warning(message, action, userId, req, details) {
    return this.log('warning', message, action, userId, req, details);
  }

  static async error(message, action, userId, req, details) {
    return this.log('error', message, action, userId, req, details);
  }

  static async getLogs(limit = 50, level = null) {
    try {
      const filter = level ? { level } : {};
      return await SystemLog.find(filter)
        .populate('userId', 'name idNumber role')
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      console.error('Get logs error:', error);
      return [];
    }
  }

  static async clearLogs() {
    try {
      await SystemLog.deleteMany({});
      return true;
    } catch (error) {
      console.error('Clear logs error:', error);
      return false;
    }
  }
}

module.exports = Logger;