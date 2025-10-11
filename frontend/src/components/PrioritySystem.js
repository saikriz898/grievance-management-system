import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';

const PriorityBadge = ({ priority, createdAt, status }) => {
  const [isOverdue, setIsOverdue] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const checkOverdue = () => {
      const now = new Date();
      const created = new Date(createdAt);
      const hoursPassed = (now - created) / (1000 * 60 * 60);

      const deadlines = {
        urgent: 24,
        high: 72,
        medium: 168,
        low: 336
      };

      const deadline = deadlines[priority] || 168;
      const hoursLeft = deadline - hoursPassed;

      if (hoursLeft <= 0 && status !== 'resolved' && status !== 'closed') {
        setIsOverdue(true);
        setTimeLeft('Overdue');
      } else if (hoursLeft > 0) {
        const days = Math.floor(hoursLeft / 24);
        const hours = Math.floor(hoursLeft % 24);
        setTimeLeft(days > 0 ? `${days}d ${hours}h left` : `${hours}h left`);
      }
    };

    checkOverdue();
    const interval = setInterval(checkOverdue, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [priority, createdAt, status]);

  const getPriorityColor = () => {
    if (isOverdue) return 'bg-red-100 text-red-800 border-red-200';
    
    const colors = {
      urgent: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[priority] || colors.medium;
  };

  const getPriorityIcon = () => {
    if (isOverdue) return '🚨';
    
    const icons = {
      urgent: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢'
    };
    return icons[priority] || icons.medium;
  };

  return (
    <div className="space-y-1">
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor()} flex items-center space-x-1`}>
        <span>{getPriorityIcon()}</span>
        <span className="capitalize">{isOverdue ? 'Overdue' : priority}</span>
      </span>
      {timeLeft && (
        <div className={`text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
          {timeLeft}
        </div>
      )}
    </div>
  );
};

const EscalationAlert = ({ grievances }) => {
  const [overdueGrievances, setOverdueGrievances] = useState([]);

  useEffect(() => {
    const checkEscalations = () => {
      const now = new Date();
      const overdue = grievances.filter(grievance => {
        if (grievance.status === 'resolved' || grievance.status === 'closed') {
          return false;
        }

        const created = new Date(grievance.createdAt);
        const hoursPassed = (now - created) / (1000 * 60 * 60);

        const deadlines = {
          urgent: 24,
          high: 72,
          medium: 168,
          low: 336
        };

        const deadline = deadlines[grievance.priority] || 168;
        return hoursPassed > deadline;
      });

      setOverdueGrievances(overdue);
    };

    checkEscalations();
    const interval = setInterval(checkEscalations, 300000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, [grievances]);

  if (overdueGrievances.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6"
    >
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-2xl">🚨</span>
        <h3 className="text-lg font-semibold text-red-800">
          Escalation Alert
        </h3>
        <span className="px-2 py-1 bg-red-200 text-red-800 rounded-full text-sm font-medium">
          {overdueGrievances.length}
        </span>
      </div>
      
      <p className="text-red-700 mb-3">
        {overdueGrievances.length} grievance(s) are overdue and require immediate attention.
      </p>

      <div className="space-y-2">
        {overdueGrievances.slice(0, 3).map(grievance => (
          <div key={grievance._id} className="bg-white rounded-lg p-3 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{grievance.title}</p>
                <p className="text-sm text-gray-600">
                  ID: {grievance.trackingId} • 
                  Priority: {grievance.priority} • 
                  Created: {new Date(grievance.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => window.location.href = `/grievance/${grievance._id}`}
                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Review
              </button>
            </div>
          </div>
        ))}
        
        {overdueGrievances.length > 3 && (
          <p className="text-sm text-red-600 text-center">
            +{overdueGrievances.length - 3} more overdue grievances
          </p>
        )}
      </div>
    </motion.div>
  );
};

export { PriorityBadge, EscalationAlert };