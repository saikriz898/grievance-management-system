import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import api from '../utils/api';
import toast from 'react-hot-toast';
import BrandedLoader from '../components/BrandedLoader';



const Dashboard = () => {
  const { user } = useAuthStore();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    inProgress: 0
  });

  useEffect(() => {
    fetchGrievances();
  }, []);

  const fetchGrievances = async () => {
    try {
      const response = await api.get('/grievances/my');
      if (response.data.success) {
        const grievanceData = response.data.grievances;
        setGrievances(grievanceData);
        
        // Calculate stats
        const total = grievanceData.length;
        const pending = grievanceData.filter(g => g.status === 'submitted').length;
        const inProgress = grievanceData.filter(g => g.status === 'in_progress').length;
        const resolved = grievanceData.filter(g => g.status === 'resolved').length;
        
        setStats({ total, pending: pending + inProgress, resolved, inProgress });
      }
    } catch (error) {
      console.error('Error fetching grievances:', error);
      toast.error('Failed to load grievances');
    } finally {
      setLoading(false);
    }
  };



  const getStatusColor = (status) => {
    const colors = {
      submitted: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-32">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header Section */}
          <div className="mb-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-2xl font-bold">{user?.name?.charAt(0)}</span>
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Welcome back, {user?.name}! 👋
                      </h1>
                      <p className="text-gray-600 mt-1 text-xl">
                        {user?.role === 'admin' ? 'Admin Dashboard - Manage all grievances' : 'Manage your grievances and track their progress'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center bg-gray-100 px-4 py-2 rounded-xl">
                      <span className="mr-2">📱</span>
                      <span className="font-medium">{user?.phone}</span>
                    </div>
                    <div className="flex items-center bg-gray-100 px-4 py-2 rounded-xl">
                      <span className="mr-2">🆔</span>
                      <span className="font-medium">{user?.idNumber}</span>
                    </div>
                    <div className="flex items-center bg-gray-100 px-4 py-2 rounded-xl">
                      <span className="mr-2">🏢</span>
                      <span className="font-medium">{user?.department || 'N/A'}</span>
                    </div>
                    <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold">
                      {user?.role?.toUpperCase()}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <Link
                    to="/submit-grievance"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-3 font-semibold"
                  >
                    <span className="text-xl">📝</span>
                    <span>New Grievance</span>
                  </Link>
                  <Link
                    to="/my-grievances"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-3 font-semibold"
                  >
                    <span className="text-xl">📋</span>
                    <span>My Grievances</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white/70 backdrop-blur-sm p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all border border-white/30 group hover:-translate-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-600 mb-2">Total Grievances</h3>
                  <p className="text-4xl font-bold text-gray-900 mb-1">{stats.total}</p>
                  <p className="text-sm text-gray-500">All time submissions</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-3xl">📊</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/70 backdrop-blur-sm p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all border border-white/30 group hover:-translate-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-600 mb-2">Pending Review</h3>
                  <p className="text-4xl font-bold text-yellow-600 mb-1">{stats.pending}</p>
                  <p className="text-sm text-gray-500">Awaiting action</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-3xl">⏳</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/70 backdrop-blur-sm p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all border border-white/30 group hover:-translate-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-600 mb-2">In Progress</h3>
                  <p className="text-4xl font-bold text-blue-600 mb-1">{stats.inProgress}</p>
                  <p className="text-sm text-gray-500">Being processed</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🔄</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white/70 backdrop-blur-sm p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all border border-white/30 group hover:-translate-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-600 mb-2">Resolved</h3>
                  <p className="text-4xl font-bold text-green-600 mb-1">{stats.resolved}</p>
                  <p className="text-sm text-gray-500">Successfully completed</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-3xl">✅</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🚀</span>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  to="/submit-grievance"
                  className="flex items-center p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group"
                >
                  <span className="mr-3 text-xl">📝</span>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-blue-700">Submit Grievance</p>
                    <p className="text-sm text-gray-600">File a new complaint</p>
                  </div>
                </Link>
                <Link
                  to="/my-grievances"
                  className="flex items-center p-3 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors group"
                >
                  <span className="mr-3 text-xl">📋</span>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-purple-700">My Grievances</p>
                    <p className="text-sm text-gray-600">View all submissions</p>
                  </div>
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                >
                  <span className="mr-3 text-xl">⚙️</span>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-gray-700">Settings</p>
                    <p className="text-sm text-gray-600">Manage your account</p>
                  </div>
                </Link>
                <Link
                  to="/my-grievances"
                  className="flex items-center p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors group"
                >
                  <span className="mr-3 text-xl">📋</span>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-green-700">My Grievances</p>
                    <p className="text-sm text-gray-600">View all submissions</p>
                  </div>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📈</span>
                Recent Activity
              </h3>
              <div className="space-y-3">
                {grievances.slice(0, 3).map((grievance, index) => (
                  <div key={grievance._id} className="flex items-center p-3 rounded-xl bg-gray-50">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {grievance.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(grievance.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(grievance.status)}`}>
                      {grievance.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
                {grievances.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">No recent activity</p>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">💡</span>
                Tips & Guidelines
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <span className="mr-2 text-blue-500">•</span>
                  <p>Provide detailed descriptions for faster resolution</p>
                </div>
                <div className="flex items-start">
                  <span className="mr-2 text-green-500">•</span>
                  <p>Upload relevant documents when submitting</p>
                </div>
                <div className="flex items-start">
                  <span className="mr-2 text-purple-500">•</span>
                  <p>Use the tracking ID to monitor progress</p>
                </div>
                <div className="flex items-start">
                  <span className="mr-2 text-orange-500">•</span>
                  <p>Contact support for urgent matters</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Grievances List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100"
          >
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <span className="mr-2">📋</span>
                My Grievances ({grievances.length})
              </h2>
              <div className="flex space-x-2">
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>All Status</option>
                  <option>Submitted</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                </select>
                <Link
                  to="/my-grievances"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <span>📋</span>
                  <span>View All</span>
                </Link>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <BrandedLoader message="Loading your grievances..." size="small" />
              ) : grievances.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">📝</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No grievances yet</h3>
                  <p className="text-gray-600 mb-6">Start by submitting your first grievance</p>
                  <Link
                    to="/submit-grievance"
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                  >
                    <span>📝</span>
                    <span>Submit Your First Grievance</span>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {grievances.map((grievance, index) => (
                    <motion.div
                      key={grievance._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:border-blue-300 group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {grievance.title}
                          </h3>
                          <p className="text-gray-600 mt-1 line-clamp-2">
                            {grievance.description}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ml-4 ${getStatusColor(grievance.status)}`}>
                          {grievance.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <span className="mr-2">🆔</span>
                          <span className="font-mono">{grievance.trackingId}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <span className="mr-2">📂</span>
                          <span>{grievance.category}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <span className="mr-2">📅</span>
                          <span>{new Date(grievance.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <span className="mr-2">⚡</span>
                          <span className="capitalize">{grievance.priority || 'Medium'}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View Details
                          </button>
                          <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                            Add Comment
                          </button>
                        </div>
                        <div className="text-xs text-gray-500">
                          Last updated: {new Date(grievance.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>


    </div>
  );
};

export default Dashboard;