import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Loading from '../components/Loading';

import Chatbot from '../components/Chatbot';
import HelpModal from '../components/HelpModal';

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [analytics, setAnalytics] = useState({
    totalGrievances: 0,
    resolvedGrievances: 0,
    pendingGrievances: 0,
    inProgressGrievances: 0,
    avgResolutionTime: 0,
    categoryBreakdown: {},
    monthlyTrends: []
  });
  const [loading, setLoading] = useState(true);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/analytics');
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      try {
        const fallbackResponse = await api.get('/admin/grievances');
        if (fallbackResponse.data.success) {
          const grievances = fallbackResponse.data.grievances;
          
          const totalGrievances = grievances.length;
          const resolvedGrievances = grievances.filter(g => g.status === 'resolved').length;
          const pendingGrievances = grievances.filter(g => g.status === 'submitted').length;
          const inProgressGrievances = grievances.filter(g => g.status === 'in_progress').length;
          
          const categoryBreakdown = {};
          grievances.forEach(g => {
            categoryBreakdown[g.category] = (categoryBreakdown[g.category] || 0) + 1;
          });
          
          const avgResolutionTime = calculateAvgResolutionTime(grievances);
          
          setAnalytics({
            totalGrievances,
            resolvedGrievances,
            pendingGrievances,
            inProgressGrievances,
            avgResolutionTime,
            categoryBreakdown,
            monthlyTrends: []
          });
        }
      } catch (fallbackError) {
        toast.error('Failed to load analytics data');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateAvgResolutionTime = (grievances) => {
    const resolved = grievances.filter(g => g.status === 'resolved' && g.resolvedAt);
    if (resolved.length === 0) return 0;
    
    const totalTime = resolved.reduce((sum, g) => {
      const created = new Date(g.createdAt);
      const resolvedDate = new Date(g.resolvedAt);
      return sum + (resolvedDate - created);
    }, 0);
    
    return Math.round(totalTime / resolved.length / (1000 * 60 * 60 * 24));
  };

  const generateReport = async (reportType) => {
    toast.success(`Generating ${reportType} report...`);
  };

  const resolutionRate = analytics.totalGrievances > 0 
    ? ((analytics.resolvedGrievances / analytics.totalGrievances) * 100).toFixed(1)
    : 0;

  if (loading) return <Loading message="Loading analytics..." />;

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
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <span className="text-blue-600 text-2xl">📈</span>
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">System Analytics</h1>
                  <p className="text-gray-600 mt-2 text-lg">Performance insights and reporting</p>
                </div>
                <button
                  onClick={() => setShowHelp(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2 font-semibold"
                >
                  <span className="text-xl">❓</span>
                  <span>Help</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-3">📊</span>
                Performance Metrics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Grievances</span>
                  <span className="text-gray-900 font-bold">{analytics.totalGrievances}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Resolution Rate</span>
                  <span className="text-green-600 font-bold">{resolutionRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending Cases</span>
                  <span className="text-yellow-600 font-bold">{analytics.pendingGrievances}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg Resolution Time</span>
                  <span className="text-blue-600 font-bold">{analytics.avgResolutionTime} days</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-3">📈</span>
                Status Overview
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 text-sm">Resolved</span>
                    <span className="text-green-600 text-sm">✅</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{analytics.resolvedGrievances}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 text-sm">In Progress</span>
                    <span className="text-blue-600 text-sm">🔄</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{analytics.inProgressGrievances}</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-3">🎯</span>
                Category Breakdown
              </h3>
              <div className="space-y-3">
                {Object.entries(analytics.categoryBreakdown).length > 0 ? (
                  Object.entries(analytics.categoryBreakdown).map(([category, count]) => {
                    const percentage = analytics.totalGrievances > 0 
                      ? ((count / analytics.totalGrievances) * 100).toFixed(1)
                      : 0;
                    return (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-gray-600 capitalize">{category}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-900 font-bold text-sm">{percentage}%</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-200">
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <span className="mr-3">📋</span>
                  Generate Reports
                </h2>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 3 Months</option>
                  <option value="1y">Last Year</option>
                </select>
              </div>
            </div>

            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <button 
                  onClick={() => generateReport('performance')}
                  className="p-6 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl transition-all text-left hover:border-blue-400 hover:shadow-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <span className="text-blue-600 text-xl">📊</span>
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-semibold">Performance Report</h3>
                      <p className="text-gray-600 text-sm">System performance and metrics</p>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => generateReport('user-activity')}
                  className="p-6 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl transition-all text-left hover:border-green-400 hover:shadow-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <span className="text-green-600 text-xl">👥</span>
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-semibold">User Activity Report</h3>
                      <p className="text-gray-600 text-sm">User engagement and activity</p>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => generateReport('trends')}
                  className="p-6 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl transition-all text-left hover:border-purple-400 hover:shadow-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <span className="text-purple-600 text-xl">📈</span>
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-semibold">Trend Analysis</h3>
                      <p className="text-gray-600 text-sm">Grievance trends and patterns</p>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => generateReport('custom')}
                  className="p-6 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl transition-all text-left hover:border-yellow-400 hover:shadow-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <span className="text-yellow-600 text-xl">📋</span>
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-semibold">Custom Report</h3>
                      <p className="text-gray-600 text-sm">Generate custom analytics</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chatbot */}
      <Chatbot 
        isOpen={showChatbot} 
        onClose={() => setShowChatbot(false)} 
      />

      {/* Help Modal */}
      <HelpModal 
        isOpen={showHelp} 
        onClose={() => setShowHelp(false)} 
        page="analytics"
      />

      {/* Floating Message Button */}
      {!showChatbot && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1 }}
          onClick={() => setShowChatbot(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 flex items-center justify-center z-40"
        >
          <span className="text-2xl">💬</span>
        </motion.button>
      )}
    </div>
  );
};

export default AdminAnalytics;