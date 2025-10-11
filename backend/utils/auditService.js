const AuditLog = require('../models/AuditLog');

class AuditService {
  async log(action, resource, resourceId, userId, changes = null, req = null, confidential = false) {
    try {
      const auditEntry = new AuditLog({
        action,
        resource,
        resourceId,
        userId,
        changes,
        metadata: {
          ip: req?.ip || req?.connection?.remoteAddress,
          userAgent: req?.get('User-Agent'),
          timestamp: new Date()
        },
        confidential
      });

      await auditEntry.save();
      return auditEntry;
    } catch (error) {
      console.error('Audit logging failed:', error);
    }
  }

  async getAuditLogs(filters = {}, limit = 100) {
    try {
      const query = {};
      
      if (filters.userId) query.userId = filters.userId;
      if (filters.resource) query.resource = filters.resource;
      if (filters.action) query.action = filters.action;
      if (filters.dateFrom) query.createdAt = { $gte: new Date(filters.dateFrom) };
      if (filters.dateTo) {
        query.createdAt = { ...query.createdAt, $lte: new Date(filters.dateTo) };
      }

      return await AuditLog.find(query)
        .populate('userId', 'name idNumber role')
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return [];
    }
  }

  async getResourceHistory(resource, resourceId) {
    try {
      return await AuditLog.find({ resource, resourceId })
        .populate('userId', 'name idNumber role')
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error('Failed to fetch resource history:', error);
      return [];
    }
  }
}

module.exports = new AuditService();