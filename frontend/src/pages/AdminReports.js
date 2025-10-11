import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Loading from '../components/Loading';

import Chatbot from '../components/Chatbot';
import HelpModal from '../components/HelpModal';

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    grievances: [],
    users: [],
    stats: {}
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30');
  const [showChatbot, setShowChatbot] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [dateRange]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchReportData = async () => {
    try {
      const [grievancesRes, usersRes] = await Promise.all([
        api.get('/grievances'),
        api.get('/admin/users')
      ]);

      const grievances = grievancesRes.data.grievances || [];
      const users = usersRes.data.users || [];

      const stats = {
        totalGrievances: grievances.length,
        totalUsers: users.length,
        resolvedGrievances: grievances.filter(g => g.status === 'resolved').length,
        pendingGrievances: grievances.filter(g => g.status === 'submitted').length,
        inProgressGrievances: grievances.filter(g => g.status === 'in_progress').length,
        avgResolutionTime: calculateAvgResolutionTime(grievances),
        categoryBreakdown: getCategoryBreakdown(grievances),
        monthlyTrends: getMonthlyTrends(grievances),
        userRoleBreakdown: getUserRoleBreakdown(users)
      };

      setReportData({ grievances, users, stats });
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to fetch report data');
      setReportData({ grievances: [], users: [], stats: {} });
    } finally {
      setLoading(false);
    }
  };

  const calculateAvgResolutionTime = (grievances) => {
    const resolved = grievances.filter(g => g.status === 'resolved' && g.resolvedAt);
    if (resolved.length === 0) return 0;
    
    const totalTime = resolved.reduce((sum, g) => {
      const created = new Date(g.createdAt);
      const resolved = new Date(g.resolvedAt);
      return sum + (resolved - created);
    }, 0);
    
    return Math.round(totalTime / resolved.length / (1000 * 60 * 60 * 24));
  };

  const getCategoryBreakdown = (grievances) => {
    const breakdown = {};
    grievances.forEach(g => {
      breakdown[g.category] = (breakdown[g.category] || 0) + 1;
    });
    return breakdown;
  };

  const getMonthlyTrends = (grievances) => {
    const trends = {};
    grievances.forEach(g => {
      const month = new Date(g.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      trends[month] = (trends[month] || 0) + 1;
    });
    return trends;
  };

  const getUserRoleBreakdown = (users) => {
    const breakdown = {};
    users.forEach(u => {
      breakdown[u.role] = (breakdown[u.role] || 0) + 1;
    });
    return breakdown;
  };

  const exportReport = (format) => {
    toast.success(`Exporting report in ${format.toUpperCase()} format...`);
  };

  if (loading) return <Loading message="Generating reports..." />;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'grievances', label: 'Grievances', icon: '📝' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'analytics', label: 'Analytics', icon: '📈' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-32 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <span className="text-blue-600 text-2xl">📊</span>
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Admin Reports</h1>
                  <p className="text-gray-600 mt-2">Comprehensive system analytics and insights</p>
                </div>
                <button
                  onClick={() => setShowHelp(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2 font-semibold"
                >
                  <span className="text-xl">❓</span>
                  <span>Help</span>
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
                <div className="flex space-x-2">
                  <button
                    onClick={() => exportReport('pdf')}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all"
                  >
                    📄 PDF
                  </button>
                  <button
                    onClick={() => exportReport('excel')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all"
                  >
                    📊 Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 mb-8"
        >
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Key Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-2xl font-bold text-gray-900">{reportData.stats.totalGrievances}</div>
                    <div className="text-gray-600 text-sm">Total Grievances</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-2xl font-bold text-green-600">{reportData.stats.resolvedGrievances}</div>
                    <div className="text-gray-600 text-sm">Resolved</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-2xl font-bold text-yellow-600">{reportData.stats.pendingGrievances}</div>
                    <div className="text-gray-600 text-sm">Pending</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-2xl font-bold text-blue-600">{reportData.stats.avgResolutionTime}</div>
                    <div className="text-gray-600 text-sm">Avg Days to Resolve</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Category Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(reportData.stats.categoryBreakdown || {}).map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-gray-700 capitalize">{category}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(count / reportData.stats.totalGrievances) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-900 font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">User Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-2xl font-bold text-gray-900">{reportData.stats.totalUsers}</div>
                    <div className="text-gray-600 text-sm">Total Users</div>
                  </div>
                  {Object.entries(reportData.stats.userRoleBreakdown || {}).map(([role, count]) => (
                    <div key={role} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div className="text-2xl font-bold text-gray-900">{count}</div>
                      <div className="text-gray-600 text-sm capitalize">{role}s</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
                <div className="space-y-3">
                  {reportData.grievances.slice(0, 5).map(grievance => (
                    <div key={grievance._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <div>
                        <div className="text-gray-900 font-medium">{grievance.title}</div>
                        <div className="text-gray-600 text-sm">{grievance.submittedBy?.name}</div>
                      </div>
                      <div className="text-gray-600 text-sm">
                        {new Date(grievance.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'grievances' && (
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Grievance Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-gray-700 p-3">ID</th>
                      <th className="text-left text-gray-700 p-3">Title</th>
                      <th className="text-left text-gray-700 p-3">Category</th>
                      <th className="text-left text-gray-700 p-3">Status</th>
                      <th className="text-left text-gray-700 p-3">Submitted By</th>
                      <th className="text-left text-gray-700 p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.grievances.map(grievance => (
                      <tr key={grievance._id} className="border-b border-gray-100">
                        <td className="text-gray-900 p-3 font-mono text-sm">{grievance.trackingId}</td>
                        <td className="text-gray-900 p-3">{grievance.title}</td>
                        <td className="text-gray-700 p-3 capitalize">{grievance.category}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            grievance.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            grievance.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {grievance.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="text-gray-900 p-3">{grievance.submittedBy?.name}</td>
                        <td className="text-gray-700 p-3">{new Date(grievance.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">User Management</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-gray-700 p-3">Name</th>
                      <th className="text-left text-gray-700 p-3">Role</th>
                      <th className="text-left text-gray-700 p-3">Phone</th>
                      <th className="text-left text-gray-700 p-3">Department</th>
                      <th className="text-left text-gray-700 p-3">Grievances</th>
                      <th className="text-left text-gray-700 p-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.users.map(user => (
                      <tr key={user._id} className="border-b border-gray-100">
                        <td className="text-gray-900 p-3">{user.name}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs capitalize">
                            {user.role}
                          </span>
                        </td>
                        <td className="text-gray-700 p-3">{user.phone}</td>
                        <td className="text-gray-700 p-3">{user.department || 'N/A'}</td>
                        <td className="text-gray-900 p-3">
                          {reportData.grievances.filter(g => g.submittedBy?._id === user._id).length}
                        </td>
                        <td className="text-gray-700 p-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Monthly Trends</h3>
                <div className="space-y-4">
                  {Object.entries(reportData.stats.monthlyTrends || {}).map(([month, count]) => (
                    <div key={month} className="flex justify-between items-center">
                      <span className="text-gray-700">{month}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-blue-500 h-3 rounded-full"
                            style={{ width: `${Math.min((count / Math.max(...Object.values(reportData.stats.monthlyTrends || {}))) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-900 font-medium w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-lg font-bold text-green-600">
                      {reportData.stats.totalGrievances > 0 ? 
                        Math.round((reportData.stats.resolvedGrievances / reportData.stats.totalGrievances) * 100) : 0}%
                    </div>
                    <div className="text-gray-600 text-sm">Resolution Rate</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-lg font-bold text-blue-600">{reportData.stats.avgResolutionTime} days</div>
                    <div className="text-gray-600 text-sm">Average Resolution Time</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-lg font-bold text-yellow-600">
                      {reportData.stats.totalGrievances > 0 ? 
                        Math.round((reportData.stats.pendingGrievances / reportData.stats.totalGrievances) * 100) : 0}%
                    </div>
                    <div className="text-gray-600 text-sm">Pending Rate</div>
                  </div>
                </div>
              </div>
            </div>
          )}
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
        page="reports"
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

export default AdminReports;