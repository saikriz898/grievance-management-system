import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AssignmentModal = ({ grievanceId, isOpen, onClose, onAssigned }) => {
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchStaff();
    }
  }, [isOpen]);

  const fetchStaff = async () => {
    try {
      const response = await api.get('/admin/staff');
      if (response.data.success) {
        setStaff(response.data.staff);
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    }
  };

  const handleAssign = async () => {
    if (!selectedStaff) {
      toast.error('Please select a staff member');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put(`/grievances/${grievanceId}/assign`, {
        assignedTo: selectedStaff
      });

      if (response.data.success) {
        toast.success('Grievance assigned successfully');
        onAssigned(selectedStaff);
        onClose();
      }
    } catch (error) {
      toast.error('Failed to assign grievance');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl max-w-md w-full p-6"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">👤</span>
          Assign Grievance
        </h3>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Staff Member
          </label>
          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose staff member...</option>
            {staff.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name} - {member.department} ({member.role})
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={loading || !selectedStaff}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{loading ? 'Assigning...' : 'Assign'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const AssignmentButton = ({ grievanceId, currentAssignee, onAssigned }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm flex items-center space-x-1"
      >
        <span>👤</span>
        <span>{currentAssignee ? 'Reassign' : 'Assign'}</span>
      </button>

      <AssignmentModal
        grievanceId={grievanceId}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAssigned={onAssigned}
      />
    </>
  );
};

export default AssignmentButton;