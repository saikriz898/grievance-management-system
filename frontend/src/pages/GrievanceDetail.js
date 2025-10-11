import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Loading from '../components/Loading';


const GrievanceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  useEffect(() => {
    fetchGrievance();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchGrievance = async () => {
    try {
      const response = await api.get(`/grievances/${id}`);
      if (response.data.success) {
        setGrievance(response.data.grievance);
      }
    } catch (error) {
      toast.error('Failed to load grievance details');
      navigate('/my-grievances');
    } finally {
      setLoading(false);
    }
  };

  const addComment = async () => {
    if (!comment.trim()) return;
    setAddingComment(true);
    try {
      const response = await api.post(`/grievances/${id}/comments`, { comment });
      if (response.data.success) {
        toast.success('Comment added successfully');
        setComment('');
        fetchGrievance();
      }
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setAddingComment(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      const response = await api.put(`/grievances/${id}/status`, { status });
      if (response.data.success) {
        toast.success('Status updated successfully');
        fetchGrievance();
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const deleteGrievance = async () => {
    if (window.confirm('Are you sure you want to delete this grievance? This action cannot be undone.')) {
      try {
        const response = await api.delete(`/admin/grievances/${id}`);
        if (response.data.success) {
          toast.success('Grievance deleted successfully');
          navigate('/admin');
        } else {
          toast.error(response.data.message || 'Failed to delete grievance');
        }
      } catch (error) {
        console.error('Error deleting grievance:', error);
        toast.error(error.response?.data?.message || 'Failed to delete grievance');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      submitted: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      closed: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) return <Loading message="Loading grievance details..." />;
  if (!grievance) return <div>Grievance not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-32 fade-in">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4 cursor-glow"
          >
            <span className="mr-2">←</span> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{grievance.title}</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Grievance Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">{grievance.description}</p>
            </motion.div>

            {/* Comments Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Comments</h2>
              
              {/* Add Comment */}
              <div className="mb-6">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="3"
                />
                <button
                  onClick={addComment}
                  disabled={!comment.trim() || addingComment}
                  className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all cursor-glow flex items-center space-x-2"
                >
                  {addingComment && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  <span>{addingComment ? 'Adding...' : 'Add Comment'}</span>
                </button>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {grievance.comments?.length > 0 ? (
                  grievance.comments.map((comment, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-900">{comment.user?.name || 'Anonymous'}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No comments yet</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Grievance Info</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Status</label>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(grievance.status)}`}>
                      {grievance.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Tracking ID</label>
                  <p className="font-mono text-gray-900">{grievance.trackingId}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Category</label>
                  <p className="text-gray-900 capitalize">{grievance.category}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Priority</label>
                  <p className="text-gray-900 capitalize">{grievance.priority || 'Medium'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Submitted By</label>
                  <p className="text-gray-900">{grievance.submittedBy?.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Submitted On</label>
                  <p className="text-gray-900">{new Date(grievance.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Last Updated</label>
                  <p className="text-gray-900">{new Date(grievance.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </motion.div>

            {/* Admin Actions */}
            {user?.role === 'admin' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Admin Actions</h3>
                <div className="space-y-3">
                  <select
                    value={grievance.status}
                    onChange={(e) => updateStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="submitted">Submitted</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all cursor-glow">
                    Assign to User
                  </button>
                  <button 
                    onClick={deleteGrievance}
                    className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all cursor-glow"
                  >
                    🗑️ Delete Grievance
                  </button>
                </div>
              </motion.div>
            )}

            {/* Attachments */}
            {grievance.attachments?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Attachments</h3>
                <div className="space-y-2">
                  {grievance.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-glow"
                    >
                      <span className="mr-2">📎</span>
                      <span className="text-blue-600">{attachment.name}</span>
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrievanceDetail;