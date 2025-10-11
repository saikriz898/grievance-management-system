import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Loading from '../components/Loading';


const TrackGrievance = () => {
  const [trackingId, setTrackingId] = useState('');
  const [email, setEmail] = useState('');
  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) {
      toast.error('Please enter a tracking ID');
      return;
    }

    setLoading(true);
    try {
      const url = email ? `/grievances/track/${trackingId}?email=${email}` : `/grievances/track/${trackingId}`;
      const response = await api.get(url);
      
      if (response.data.success) {
        setGrievance(response.data.grievance);
        if (email) {
          toast.success('Grievance found! Email notification sent.');
        } else {
          toast.success('Grievance found!');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Grievance not found');
      setGrievance(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      submitted: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
      resolved: 'bg-green-50 text-green-700 border-green-200',
      closed: 'bg-gray-50 text-gray-700 border-gray-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      submitted: '📝',
      in_progress: '⏳',
      resolved: '✅',
      closed: '📁'
    };
    return icons[status] || '📄';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-32">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <span className="text-white text-4xl">🔍</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Track Your Grievance
          </h1>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
            Enter your unique tracking ID to monitor the real-time status and progress of your grievance submission
          </p>
          <div className="mt-8">
            <Link 
              to="/" 
              className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all"
            >
              <span className="mr-2">←</span>
              Back to Home
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-3xl p-10 shadow-2xl mb-12"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="flex items-center text-xl font-semibold text-gray-800 mb-4">
                <span className="mr-3 text-2xl">🆔</span>
                Grievance Tracking ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter your tracking ID (e.g., GRV-2024-123456)"
                  className="w-full px-8 py-6 text-xl border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white font-mono tracking-wider"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                />
                <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                  <span className="text-gray-400 text-2xl">🔍</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 flex items-center">
                <span className="mr-2">💡</span>
                Your tracking ID was provided when you submitted your grievance
              </p>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center text-lg font-semibold text-gray-800 mb-4">
                <span className="mr-3 text-2xl">📧</span>
                Email for Notification (Optional)
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email to receive tracking details"
                  className="w-full px-8 py-6 text-xl border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                  <span className="text-gray-400 text-2xl">📧</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 flex items-center">
                <span className="mr-2">📬</span>
                We'll send you the grievance details via email
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading || !trackingId.trim()}
              className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl text-xl transform hover:-translate-y-1 disabled:transform-none disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loading message="Searching for your grievance..." />
              ) : (
                <span className="flex items-center justify-center">
                  <span className="mr-3 text-2xl">🚀</span>
                  Track My Grievance
                </span>
              )}
            </button>
          </form>
        </motion.div>

        {grievance && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Grievance Details
                  </h2>
                  <p className="text-gray-600">Tracking ID: {grievance.trackingId}</p>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(grievance.status)} flex items-center space-x-2`}>
                  <span>{getStatusIcon(grievance.status)}</span>
                  <span>{grievance.status.replace('_', ' ').toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Submission Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Submitted Date:</span>
                        <p className="font-medium text-gray-900">{new Date(grievance.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Category:</span>
                        <p className="font-medium text-gray-900 capitalize">{grievance.category}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Priority:</span>
                        <p className="font-medium text-gray-900 capitalize">{grievance.priority}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Progress Timeline
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-900">Grievance Submitted</span>
                      </div>
                      <div className={`flex items-center space-x-3 ${grievance.status !== 'submitted' ? 'opacity-100' : 'opacity-50'}`}>
                        <div className={`w-3 h-3 rounded-full ${grievance.status !== 'submitted' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-sm text-gray-900">Under Review</span>
                      </div>
                      <div className={`flex items-center space-x-3 ${grievance.status === 'resolved' || grievance.status === 'closed' ? 'opacity-100' : 'opacity-50'}`}>
                        <div className={`w-3 h-3 rounded-full ${grievance.status === 'resolved' || grievance.status === 'closed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-sm text-gray-900">Resolved</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Grievance Title
                  </h3>
                  <p className="text-lg font-medium text-gray-900">{grievance.title}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {grievance.description}
                  </p>
                </div>

                {grievance.assignedTo && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Assigned To
                    </h3>
                    <p className="text-gray-900 font-medium">{grievance.assignedTo.name}</p>
                  </div>
                )}

                {grievance.comments && grievance.comments.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                      Updates & Comments
                    </h3>
                    <div className="space-y-4">
                      {grievance.comments.map((comment, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-gray-900">
                              {comment.user?.name || 'System'}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{comment.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 bg-blue-50 border border-blue-200 rounded-2xl p-8"
        >
          <h3 className="text-xl font-bold text-blue-900 mb-4">Need Help?</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">📞 Contact Support</h4>
              <p className="text-blue-700">Email: support@grievai.com</p>
              <p className="text-blue-700">Phone: +1-800-GRIEV-AI</p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">🕒 Response Times</h4>
              <p className="text-blue-700">Normal: 24-48 hours</p>
              <p className="text-blue-700">Urgent: 2-4 hours</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TrackGrievance;