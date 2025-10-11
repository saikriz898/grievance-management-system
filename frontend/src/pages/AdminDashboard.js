import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import BrandedLoader from '../components/BrandedLoader';



const AdminDashboard = () => {
  console.log('AdminDashboard component loaded');
  const navigate = useNavigate();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    title: '',
    category: '',
    priority: '',
    submittedBy: '',
    dateFrom: '',
    dateTo: '',
    trackingId: ''
  });


  useEffect(() => {
    // Test API connection first
    const testConnection = async () => {
      try {
        await api.get('/health');
        console.log('Backend connection successful');
      } catch (error) {
        console.error('Backend connection failed:', error);
        toast.error('Backend server is not running. Please start the backend server.');
      }
    };
    
    testConnection();
    fetchGrievances();
  }, []);

  const fetchGrievances = async () => {
    try {
      console.log('Fetching grievances...');
      const response = await api.get('/admin/grievances');
      console.log('Response:', response.data);
      if (response.data.success) {
        setGrievances(response.data.grievances || []);
        toast.success(`Loaded ${response.data.grievances?.length || 0} grievances`);
      } else {
        toast.error('Failed to load grievances');
        setGrievances([]);
      }
    } catch (error) {
      console.error('Error fetching grievances:', error);
      if (error.response) {
        toast.error(`Server error: ${error.response.status}`);
      } else if (error.request) {
        toast.error('Cannot connect to server. Please check if backend is running.');
      } else {
        toast.error('Failed to fetch grievances');
      }
      setGrievances([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await api.put(`/admin/grievances/${id}/status`, { status });
      if (response.data.success) {
        toast.success('Status updated successfully');
        fetchGrievances();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const deleteGrievance = async (id) => {
    if (window.confirm('Are you sure you want to delete this grievance? This action cannot be undone.')) {
      try {
        console.log('Deleting grievance with ID:', id);
        const response = await api.delete(`/admin/grievances/${id}`);
        console.log('Delete response:', response.data);
        if (response.data.success) {
          toast.success('Grievance deleted successfully');
          fetchGrievances();
        } else {
          toast.error(response.data.message || 'Failed to delete grievance');
        }
      } catch (error) {
        console.error('Error deleting grievance:', error);
        toast.error(error.response?.data?.message || 'Failed to delete grievance');
      }
    }
  };



  const filteredGrievances = grievances.filter(grievance => {
    const matchesFilter = filter === 'all' || grievance.status === filter;
    
    const matchesSearch = !searchTerm || 
      grievance.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grievance.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grievance.trackingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grievance.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grievance.submittedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAdvanced = 
      (!advancedFilters.title || grievance.title?.toLowerCase().includes(advancedFilters.title.toLowerCase())) &&
      (!advancedFilters.category || grievance.category?.toLowerCase().includes(advancedFilters.category.toLowerCase())) &&
      (!advancedFilters.priority || grievance.priority === advancedFilters.priority) &&
      (!advancedFilters.submittedBy || grievance.submittedBy?.name?.toLowerCase().includes(advancedFilters.submittedBy.toLowerCase())) &&
      (!advancedFilters.trackingId || grievance.trackingId?.toLowerCase().includes(advancedFilters.trackingId.toLowerCase())) &&
      (!advancedFilters.dateFrom || new Date(grievance.createdAt) >= new Date(advancedFilters.dateFrom)) &&
      (!advancedFilters.dateTo || new Date(grievance.createdAt) <= new Date(advancedFilters.dateTo));
    
    return matchesFilter && matchesSearch && matchesAdvanced;
  });

  const clearAdvancedFilters = () => {
    setAdvancedFilters({
      title: '',
      category: '',
      priority: '',
      submittedBy: '',
      dateFrom: '',
      dateTo: '',
      trackingId: ''
    });
  };

  const hasAdvancedFilters = Object.values(advancedFilters).some(value => value !== '');

  const stats = {
    total: grievances.length,
    submitted: grievances.filter(g => g.status === 'submitted').length,
    in_progress: grievances.filter(g => g.status === 'in_progress').length,
    resolved: grievances.filter(g => g.status === 'resolved').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-32 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-12">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <span className="text-blue-600 text-2xl">👑</span>
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Admin Control Center</h1>
                  <p className="text-gray-600 mt-2 text-lg">Complete system management and oversight</p>
                </div>

              </div>
            </div>
          </div>

          {/* Real-time Statistics */}
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200 group hover:shadow-2xl transition-all hover-lift">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Total Grievances</h3>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-blue-600 text-xl">📋</span>
                </div>
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-2">{stats.total}</p>
              <p className="text-gray-600 text-sm">All submissions</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200 group hover:shadow-2xl transition-all hover-lift">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Pending Review</h3>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-yellow-600 text-xl">⏳</span>
                </div>
              </div>
              <p className="text-4xl font-bold text-yellow-600 mb-2">{stats.submitted}</p>
              <p className="text-gray-600 text-sm">Require admin action</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200 group hover:shadow-2xl transition-all hover-lift">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">In Progress</h3>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-blue-600 text-xl">🔄</span>
                </div>
              </div>
              <p className="text-4xl font-bold text-blue-600 mb-2">{stats.in_progress}</p>
              <p className="text-gray-600 text-sm">Under investigation</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200 group hover:shadow-2xl transition-all hover-lift">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Resolved</h3>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-green-600 text-xl">✅</span>
                </div>
              </div>
              <p className="text-4xl font-bold text-green-600 mb-2">{stats.resolved}</p>
              <p className="text-gray-600 text-sm">Successfully resolved</p>
            </div>
          </div>

          {/* Admin Quick Actions */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">👥</span>
                User Management
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={() => window.location.href = '/admin/users'}
                  className="w-full p-3 bg-blue-50 hover:bg-blue-100 text-gray-900 rounded-xl transition-all text-left border border-blue-200 hover:border-blue-400"
                >
                  <span className="mr-2">👥</span>Manage Users
                </button>
                <button className="w-full p-3 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-xl transition-all text-left border border-gray-200 hover:border-gray-400">
                  <span className="mr-2">🔄</span>Role Assignment
                </button>
                <button className="w-full p-3 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-xl transition-all text-left border border-gray-200 hover:border-gray-400">
                  <span className="mr-2">📄</span>User Reports
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📈</span>
                System Analytics
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={() => window.location.href = '/admin/analytics'}
                  className="w-full p-3 bg-blue-50 hover:bg-blue-100 text-gray-900 rounded-xl transition-all text-left border border-blue-200 hover:border-blue-400"
                >
                  <span className="mr-2">📈</span>View Analytics
                </button>
                <button 
                  onClick={() => window.location.href = '/admin/reports'}
                  className="w-full p-3 bg-blue-50 hover:bg-blue-100 text-gray-900 rounded-xl transition-all text-left border border-blue-200 hover:border-blue-400"
                >
                  <span className="mr-2">📊</span>Reports & Data
                </button>
                <button className="w-full p-3 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-xl transition-all text-left border border-gray-200 hover:border-gray-400">
                  <span className="mr-2">📅</span>Export Data
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">⚙️</span>
                System Control
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={() => window.location.href = '/admin/settings'}
                  className="w-full p-3 bg-blue-50 hover:bg-blue-100 text-gray-900 rounded-xl transition-all text-left border border-blue-200 hover:border-blue-400"
                >
                  <span className="mr-2">⚙️</span>System Settings
                </button>
                <button className="w-full p-3 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-xl transition-all text-left border border-gray-200 hover:border-gray-400">
                  <span className="mr-2">🔒</span>Security Center
                </button>
                <button 
                  onClick={() => window.location.href = '/admin/enhanced'}
                  className="w-full p-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-gray-900 rounded-xl transition-all text-left border border-blue-200 hover:border-blue-400"
                >
                  <span className="mr-2">🚀</span>Enhanced Portal
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 mb-8">
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                    <span className="mr-3">📋</span>
                    Grievance Management
                  </h2>
                  <div className="text-sm text-gray-600">
                    Showing {filteredGrievances.length} of {grievances.length} grievances
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Quick search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      🔍
                    </div>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setShowAdvancedSearch(true)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      hasAdvancedFilters 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🔧 Advanced
                  </button>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
                  >
                    <option value="all">All Status</option>
                    <option value="submitted">Submitted</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                {hasAdvancedFilters && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <span>Advanced filters active</span>
                    <button
                      onClick={clearAdvancedFilters}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8">
              {loading ? (
                <BrandedLoader message="Loading grievances..." size="small" />
              ) : filteredGrievances.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">📋</span>
                  </div>
                  <p className="text-gray-700 text-lg">No grievances found</p>
                  <p className="text-gray-600 text-sm mt-2">
                    {searchTerm ? `No results for "${searchTerm}"` : 'Adjust filters or check back later'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {filteredGrievances.map((grievance, index) => (
                    <motion.div
                      key={grievance._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white border border-gray-200 rounded-3xl p-6 hover:shadow-2xl transition-all group hover-lift"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                              {grievance.title}
                            </h3>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                              {grievance.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {grievance.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div className="flex items-center text-gray-600">
                          <span className="mr-2">🆔</span>
                          <span className="font-mono text-gray-900">{grievance.trackingId}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <span className="mr-2">👤</span>
                          <span className="text-gray-900">{grievance.submittedBy?.name}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <span className="mr-2">📂</span>
                          <span className="text-gray-900 capitalize">{grievance.category}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <span className="mr-2">📅</span>
                          <span className="text-gray-900">{new Date(grievance.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => navigate(`/grievance/${grievance._id}`)}
                            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-gray-900 rounded-xl transition-all text-sm font-medium border border-blue-200 cursor-glow"
                          >
                            📄 View Details
                          </button>
                          <button 
                            onClick={() => navigate(`/grievance/${grievance._id}`)}
                            className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-xl transition-all text-sm font-medium border border-gray-200 cursor-glow"
                          >
                            💬 Add Comment
                          </button>
                          <button 
                            onClick={() => deleteGrievance(grievance._id)}
                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition-all text-sm font-medium border border-red-200 cursor-glow"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                        <select
                          value={grievance.status}
                          onChange={(e) => updateStatus(grievance._id, e.target.value)}
                          className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-sm"
                        >
                          <option value="submitted">Submitted</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Advanced Search Modal */}
      {showAdvancedSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Advanced Grievance Search</h2>
              <button
                onClick={() => setShowAdvancedSearch(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={advancedFilters.title}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search in title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tracking ID</label>
                <input
                  type="text"
                  value={advancedFilters.trackingId}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, trackingId: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter tracking ID..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={advancedFilters.category}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="academic">Academic</option>
                  <option value="administrative">Administrative</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="hostel">Hostel</option>
                  <option value="library">Library</option>
                  <option value="transport">Transport</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={advancedFilters.priority}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, priority: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Submitted By</label>
                <input
                  type="text"
                  value={advancedFilters.submittedBy}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, submittedBy: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="User name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
                <input
                  type="date"
                  value={advancedFilters.dateFrom}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, dateFrom: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
                <input
                  type="date"
                  value={advancedFilters.dateTo}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, dateTo: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={clearAdvancedFilters}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Clear All
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAdvancedSearch(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowAdvancedSearch(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;