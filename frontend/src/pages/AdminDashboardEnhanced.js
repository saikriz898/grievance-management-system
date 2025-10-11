import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';

const AdminDashboardEnhanced = () => {
  const [realtimeStats, setRealtimeStats] = useState({});
  const [escalations, setEscalations] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [aiStats, setAiStats] = useState({});
  const [googleStatus, setGoogleStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchRealtimeData();
    const interval = setInterval(fetchRealtimeData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchRealtimeData = async () => {
    try {
      const [statsRes, escalationsRes, auditRes] = await Promise.all([
        api.get('/admin/realtime/stats'),
        api.get('/admin/escalations'),
        api.get('/admin/audit?limit=10')
      ]);
      
      // Try to get AI stats and Google status
      let aiRes = { data: { success: true, stats: {} } };
      let googleRes = { data: { success: true, status: {} } };
      try {
        aiRes = await api.get('/admin/ai/stats');
        googleRes = await api.get('/admin/google/status');
      } catch (error) {
        console.log('Additional services not available');
      }

      if (statsRes.data.success) setRealtimeStats(statsRes.data.stats);
      if (escalationsRes.data.success) setEscalations(escalationsRes.data.escalations);
      if (auditRes.data.success) setAuditLogs(auditRes.data.logs);
      if (aiRes.data.success) setAiStats(aiRes.data.stats);
      if (googleRes.data.success) setGoogleStatus(googleRes.data.status);
    } catch (error) {
      console.error('Failed to fetch realtime data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGoogleSheet = async () => {
    try {
      const response = await api.post('/admin/google/create-sheet');
      if (response.data.success) {
        toast.success('Google Sheet created successfully!');
        window.open(response.data.url, '_blank');
        fetchRealtimeData();
      }
    } catch (error) {
      toast.error('Failed to create Google Sheet');
    }
  };

  const syncToGoogleSheets = async (syncAll = false) => {
    try {
      const payload = syncAll ? {} : { grievanceIds: escalations.map(e => e._id) };
      const response = await api.post('/admin/google/sync', payload);
      
      if (response.data.success) {
        toast.success(`Synced ${response.data.synced} grievances to Google Sheets`);
      }
    } catch (error) {
      toast.error('Failed to sync to Google Sheets');
    }
  };

  const manualEscalate = async (grievanceId) => {
    try {
      await api.post(`/admin/escalations/manual/${grievanceId}`);
      toast.success('Grievance escalated successfully');
      fetchRealtimeData();
    } catch (error) {
      toast.error('Failed to escalate grievance');
    }
  };

  const batchCategorize = async () => {
    try {
      const response = await api.post('/admin/ai/batch-categorize');
      if (response.data.success) {
        toast.success(`AI processed ${response.data.processed} grievances`);
        fetchRealtimeData();
      }
    } catch (error) {
      toast.error('AI feature not available');
    }
  };

  const TabButton = ({ id, label, icon, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
        active 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
      }`}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-32 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-2xl">🚀</span>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Enhanced Admin Portal
                    </h1>
                    <p className="text-gray-600 mt-2 text-lg">Real-time monitoring & automated management</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Live Updates</span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Stats */}
          <div className="grid md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600">Today's Submissions</h3>
                <span className="text-2xl">📈</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">{realtimeStats.today || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600">This Week</h3>
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-3xl font-bold text-green-600">{realtimeStats.thisWeek || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600">Escalated</h3>
                <span className="text-2xl">🚨</span>
              </div>
              <p className="text-3xl font-bold text-red-600">{realtimeStats.escalated || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600">Avg Resolution</h3>
                <span className="text-2xl">⏱️</span>
              </div>
              <p className="text-3xl font-bold text-purple-600">{realtimeStats.avgResolutionTime || 0}h</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600">Pending</h3>
                <span className="text-2xl">⏳</span>
              </div>
              <p className="text-3xl font-bold text-yellow-600">{realtimeStats.pending || 0}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-8">
            <TabButton 
              id="overview" 
              label="Overview" 
              icon="📊" 
              active={activeTab === 'overview'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              id="escalations" 
              label="Escalations" 
              icon="🚨" 
              active={activeTab === 'escalations'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              id="integrations" 
              label="Integrations" 
              icon="🔗" 
              active={activeTab === 'integrations'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              id="audit" 
              label="Audit Logs" 
              icon="📋" 
              active={activeTab === 'audit'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              id="ai" 
              label="AI Features" 
              icon="🤖" 
              active={activeTab === 'ai'} 
              onClick={setActiveTab} 
            />
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">System Overview</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Department Breakdown</h3>
                    <div className="space-y-3">
                      {realtimeStats.departmentBreakdown?.map((dept, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{dept._id || 'Unknown'}</span>
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">{dept.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Priority Distribution</h3>
                    <div className="space-y-3">
                      {realtimeStats.priorityBreakdown?.map((priority, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium capitalize">{priority._id}</span>
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            priority._id === 'urgent' ? 'bg-red-100 text-red-800' :
                            priority._id === 'high' ? 'bg-orange-100 text-orange-800' :
                            priority._id === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>{priority.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'escalations' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Escalated Grievances</h2>
                  <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium">
                    {escalations.length} Active
                  </span>
                </div>
                <div className="space-y-4">
                  {escalations.map((grievance) => (
                    <div key={grievance._id} className="border border-red-200 rounded-xl p-6 bg-red-50">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{grievance.title}</h3>
                          <p className="text-gray-600 text-sm">ID: {grievance.trackingId}</p>
                        </div>
                        <div className="flex space-x-2">
                          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                            ESCALATED
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            grievance.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            grievance.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {grievance.priority.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                        <div>👤 {grievance.submittedBy?.name}</div>
                        <div>📅 {new Date(grievance.escalatedAt).toLocaleDateString()}</div>
                        <div>🏢 {grievance.submittedBy?.department}</div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => window.location.href = `/grievance/${grievance._id}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Google Integrations</h2>
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-3">📊</span>
                      <h3 className="text-lg font-semibold">Google Sheets Integration</h3>
                      <span className={`ml-auto px-2 py-1 rounded-full text-xs ${
                        googleStatus.googleIntegration ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {googleStatus.googleIntegration ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Create and sync grievance data to Google Sheets for external tracking and reporting.
                    </p>
                    <div className="space-y-2">
                      <button
                        onClick={createGoogleSheet}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        disabled={!googleStatus.googleIntegration}
                      >
                        🆕 Create New Sheet
                      </button>
                      <button
                        onClick={() => syncToGoogleSheets(false)}
                        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                        disabled={!googleStatus.googleIntegration}
                      >
                        🔄 Sync Escalated
                      </button>
                      <button
                        onClick={() => syncToGoogleSheets(true)}
                        className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                        disabled={!googleStatus.googleIntegration}
                      >
                        📤 Sync All Data
                      </button>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-3">📧</span>
                      <h3 className="text-lg font-semibold">Gmail Notifications</h3>
                      <span className={`ml-auto px-2 py-1 rounded-full text-xs ${
                        googleStatus.googleIntegration ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {googleStatus.googleIntegration ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Automated HTML email notifications for escalations and status updates with professional templates.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Escalation Emails:</span>
                        <span className="text-green-600">✓ Enabled</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status Updates:</span>
                        <span className="text-green-600">✓ Enabled</span>
                      </div>
                      <div className="flex justify-between">
                        <span>HTML Templates:</span>
                        <span className="text-green-600">✓ Active</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="mr-2">⚙️</span>
                    Integration Status
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                        googleStatus.googleIntegration ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <p className="text-sm font-medium">Google Cloud</p>
                      <p className="text-xs text-gray-600">{googleStatus.googleIntegration ? 'Connected' : 'Not Connected'}</p>
                    </div>
                    <div className="text-center">
                      <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                        googleStatus.geminiConfigured ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <p className="text-sm font-medium">Gemini AI</p>
                      <p className="text-xs text-gray-600">{googleStatus.geminiConfigured ? 'Configured' : 'Not Configured'}</p>
                    </div>
                    <div className="text-center">
                      <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                        googleStatus.sheetConfigured ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      <p className="text-sm font-medium">Sheet ID</p>
                      <p className="text-xs text-gray-600">{googleStatus.sheetConfigured ? 'Configured' : 'Optional'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'audit' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Audit Logs</h2>
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div key={log._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <span className={`w-3 h-3 rounded-full ${
                          log.action === 'CREATE' ? 'bg-green-500' :
                          log.action === 'UPDATE' ? 'bg-blue-500' :
                          log.action === 'DELETE' ? 'bg-red-500' :
                          'bg-gray-500'
                        }`}></span>
                        <div>
                          <p className="font-medium text-gray-900">
                            {log.userId?.name} {log.action.toLowerCase()}d {log.resource}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{log.metadata?.ip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">AI-Powered Features</h2>
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-3">🤖</span>
                      <h3 className="text-lg font-semibold">AI Statistics</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Processed by AI:</span>
                        <span className="font-bold">{aiStats.totalProcessed || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>With AI Summary:</span>
                        <span className="font-bold">{aiStats.withSummary || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Category Accuracy:</span>
                        <span className="font-bold">{aiStats.categoryAccuracy || 0}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-3">⚡</span>
                      <h3 className="text-lg font-semibold">AI Actions</h3>
                    </div>
                    <div className="space-y-3">
                      <button
                        onClick={batchCategorize}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        🔄 Batch Categorize
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">AI Features Overview</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <span className="text-2xl block mb-2">🎯</span>
                      <h4 className="font-medium">Auto-Categorization</h4>
                      <p className="text-sm text-gray-600">AI categorizes grievances automatically</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <span className="text-2xl block mb-2">💭</span>
                      <h4 className="font-medium">Sentiment Analysis</h4>
                      <p className="text-sm text-gray-600">Detects priority based on emotion</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <span className="text-2xl block mb-2">🛡️</span>
                      <h4 className="font-medium">Content Moderation</h4>
                      <p className="text-sm text-gray-600">Filters inappropriate content</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <span className="text-2xl block mb-2">🧠</span>
                      <h4 className="font-medium">Natural Language</h4>
                      <p className="text-sm text-gray-600">Advanced text analysis & entities</p>
                    </div>
                    <div className="text-center p-4 bg-indigo-50 rounded-lg">
                      <span className="text-2xl block mb-2">💬</span>
                      <h4 className="font-medium">Google Chat</h4>
                      <p className="text-sm text-gray-600">Submit via Google Chat messages</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboardEnhanced;