import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import api from '../utils/api';
import toast from 'react-hot-toast';
import BrandedLoader from '../components/BrandedLoader';


const MyGrievances = () => {

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
    dateFrom: '',
    dateTo: '',
    trackingId: ''
  });


  useEffect(() => {
    fetchGrievances();
  }, []);

  const fetchGrievances = async () => {
    try {
      const response = await api.get('/grievances/my');
      if (response.data.success) {
        setGrievances(response.data.grievances);
      }
    } catch (error) {
      toast.error('Failed to load grievances');
    } finally {
      setLoading(false);
    }
  };

  const filteredGrievances = grievances.filter(g => {
    const matchesFilter = filter === 'all' || g.status === filter;
    
    // Basic search
    const matchesSearch = !searchTerm || 
      g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Advanced search
    const matchesAdvanced = 
      (!advancedFilters.title || g.title.toLowerCase().includes(advancedFilters.title.toLowerCase())) &&
      (!advancedFilters.category || g.category.toLowerCase().includes(advancedFilters.category.toLowerCase())) &&
      (!advancedFilters.priority || g.priority === advancedFilters.priority) &&
      (!advancedFilters.trackingId || g.trackingId.toLowerCase().includes(advancedFilters.trackingId.toLowerCase())) &&
      (!advancedFilters.dateFrom || new Date(g.createdAt) >= new Date(advancedFilters.dateFrom)) &&
      (!advancedFilters.dateTo || new Date(g.createdAt) <= new Date(advancedFilters.dateTo));
    
    return matchesFilter && matchesSearch && matchesAdvanced;
  });

  const clearAdvancedFilters = () => {
    setAdvancedFilters({
      title: '',
      category: '',
      priority: '',
      dateFrom: '',
      dateTo: '',
      trackingId: ''
    });
  };

  const hasAdvancedFilters = Object.values(advancedFilters).some(value => value !== '');

  const getStatusColor = (status) => {
    const colors = {
      submitted: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      closed: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) return <BrandedLoader message="Loading your grievances..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-32 fade-in">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Grievances</h1>
          <p className="text-gray-600">Track and manage all your submitted grievances</p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
        >
          {/* Search Input */}
          <div className="mb-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Quick search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                className={`px-6 py-3 rounded-xl font-medium transition-all cursor-glow ${
                  hasAdvancedFilters 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔧 Advanced
              </button>
            </div>
            {hasAdvancedFilters && (
              <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
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

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All', count: grievances.length },
              { key: 'submitted', label: 'Submitted', count: grievances.filter(g => g.status === 'submitted').length },
              { key: 'in_progress', label: 'In Progress', count: grievances.filter(g => g.status === 'in_progress').length },
              { key: 'resolved', label: 'Resolved', count: grievances.filter(g => g.status === 'resolved').length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-xl font-medium transition-all cursor-glow ${
                  filter === tab.key
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </motion.div>

        {/* Grievances Grid */}
        <div className="grid gap-6">
          {filteredGrievances.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No grievances found</h3>
              <p className="text-gray-600">
                {searchTerm || hasAdvancedFilters ? 'No grievances found matching your search criteria' : 
                 filter === 'all' ? 'You haven\'t submitted any grievances yet.' : `No ${filter.replace('_', ' ')} grievances found.`}
              </p>
            </motion.div>
          ) : (
            filteredGrievances.map((grievance, index) => (
              <motion.div
                key={grievance._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-glow"
                onClick={() => navigate(`/grievance/${grievance._id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{grievance.title}</h3>
                    <p className="text-gray-600 line-clamp-2">{grievance.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(grievance.status)}`}>
                    {grievance.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">🆔</span>
                    <span className="font-mono">{grievance.trackingId}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📂</span>
                    <span>{grievance.category}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📅</span>
                    <span>{new Date(grievance.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">⚡</span>
                    <span className="capitalize">{grievance.priority || 'Medium'}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="flex space-x-4">
                    <button 
                      onClick={() => navigate(`/grievance/${grievance._id}`)}
                      className="text-blue-600 hover:text-blue-800 font-medium cursor-glow"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => navigate(`/grievance/${grievance._id}`)}
                      className="text-gray-600 hover:text-gray-800 font-medium cursor-glow"
                    >
                      Add Comment
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    Updated: {new Date(grievance.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Advanced Search Modal */}
      {showAdvancedSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Advanced Search</h2>
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

export default MyGrievances;