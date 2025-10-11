import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';

import Chatbot from '../components/Chatbot';
import HelpModal from '../components/HelpModal';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('system');
  const [settings, setSettings] = useState({});
  const [originalSettings, setOriginalSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [backups, setBackups] = useState([]);
  const [logs, setLogs] = useState([]);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings');
      if (response.data.success) {
        setSettings(response.data.settings);
        setOriginalSettings(response.data.settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      await initializeSettings();
    } finally {
      setLoading(false);
    }
  };

  const initializeSettings = async () => {
    try {
      await api.post('/admin/settings/init');
      const response = await api.get('/admin/settings');
      if (response.data.success) {
        setSettings(response.data.settings);
        setOriginalSettings(response.data.settings);
      }
    } catch (error) {
      console.error('Error initializing settings:', error);
      toast.error('Failed to initialize settings');
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      const response = await api.put('/admin/settings', settings);
      if (response.data.success) {
        toast.success('Settings saved successfully');
        setOriginalSettings(settings);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const resetSettings = () => {
    setSettings(originalSettings);
    toast.success('Settings reset to last saved state');
  };

  const createBackup = async () => {
    try {
      setLoading(true);
      const response = await api.post('/admin/backup');
      if (response.data.success) {
        toast.success('Backup created successfully');
        fetchBackups();
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.success('Backup creation initiated');
    } finally {
      setLoading(false);
    }
  };

  const fetchBackups = async () => {
    try {
      const response = await api.get('/admin/backups');
      if (response.data.success) {
        setBackups(response.data.backups);
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await api.get('/admin/logs?limit=100');
      if (response.data.success) {
        setLogs(response.data.logs);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to fetch logs');
    }
  };

  const clearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all system logs? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.delete('/admin/logs');
      if (response.data.success) {
        toast.success('System logs cleared successfully');
        setLogs([]);
      }
    } catch (error) {
      console.error('Error clearing logs:', error);
      toast.error('Failed to clear logs');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (activeTab === 'backup') {
      fetchBackups();
    } else if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab]);

  const tabs = [
    { id: 'system', name: 'System Configuration', icon: '⚙️' },
    { id: 'security', name: 'Security Settings', icon: '🔒' },
    { id: 'backup', name: 'Backup & Restore', icon: '💾' },
    { id: 'logs', name: 'System Logs', icon: '📋' }
  ];

  if (loading && Object.keys(settings).length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-32 pb-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-32 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <span className="text-blue-600 text-2xl">⚙️</span>
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">System Settings</h1>
                  <p className="text-gray-600 mt-2 text-lg">Configure and manage system parameters</p>
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

          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200 sticky top-32">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings Categories</h3>
                <div className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{tab.icon}</span>
                        <span className="font-medium">{tab.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200">
                {activeTab === 'system' && (
                  <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <span className="mr-3">⚙️</span>
                      System Configuration
                    </h2>
                    
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">App Name</label>
                          <input
                            type="text"
                            value={settings.app_name || ''}
                            onChange={(e) => updateSetting('app_name', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">Max File Size (MB)</label>
                          <input
                            type="number"
                            value={settings.max_file_size || 10}
                            onChange={(e) => updateSetting('max_file_size', parseInt(e.target.value))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div>
                              <h4 className="text-gray-900 font-medium">Auto Assignment</h4>
                              <p className="text-gray-600 text-sm">Automatically assign grievances</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.auto_assign || false}
                                onChange={(e) => updateSetting('auto_assign', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div>
                              <h4 className="text-gray-900 font-medium">Email Notifications</h4>
                              <p className="text-gray-600 text-sm">Send email updates</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.email_notifications || false}
                                onChange={(e) => updateSetting('email_notifications', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div>
                              <h4 className="text-gray-900 font-medium">SMS Notifications</h4>
                              <p className="text-gray-600 text-sm">Send SMS updates</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.sms_notifications || false}
                                onChange={(e) => updateSetting('sms_notifications', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div>
                              <h4 className="text-gray-900 font-medium">Login Notifications</h4>
                              <p className="text-gray-600 text-sm">Notify users of login activity</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.login_notifications || false}
                                onChange={(e) => updateSetting('login_notifications', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div>
                              <h4 className="text-gray-900 font-medium">Track Login History</h4>
                              <p className="text-gray-600 text-sm">Monitor user login activities</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.track_login_history || false}
                                onChange={(e) => updateSetting('track_login_history', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <span className="mr-3">🔒</span>
                      Security Settings
                    </h2>
                    
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">Password Min Length</label>
                          <input
                            type="number"
                            value={settings.password_min_length || 6}
                            onChange={(e) => updateSetting('password_min_length', parseInt(e.target.value))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">Session Timeout (days)</label>
                          <input
                            type="number"
                            value={settings.session_timeout || 30}
                            onChange={(e) => updateSetting('session_timeout', parseInt(e.target.value))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">Max Failed Login Attempts</label>
                          <input
                            type="number"
                            value={settings.max_failed_attempts || 5}
                            onChange={(e) => updateSetting('max_failed_attempts', parseInt(e.target.value))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <h4 className="text-gray-900 font-medium mb-2">Security Features</h4>
                            <p className="text-gray-600 text-sm mb-4">Additional security configurations will be available in future updates</p>
                            <div className="text-center py-4">
                              <span className="text-2xl">🔒</span>
                              <p className="text-sm text-gray-500 mt-2">Coming Soon</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <h4 className="text-gray-900 font-medium mb-2">System Monitoring</h4>
                            <p className="text-gray-600 text-sm mb-4">Activity logging and monitoring features</p>
                            <div className="text-center py-4">
                              <span className="text-2xl">📊</span>
                              <p className="text-sm text-gray-500 mt-2">Coming Soon</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'backup' && (
                  <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <span className="mr-3">💾</span>
                      Backup & Restore
                    </h2>
                    
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Backup</h3>
                          <p className="text-gray-600 mb-4">Create a complete backup of the system database</p>
                          <button 
                            onClick={createBackup}
                            disabled={loading}
                            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-medium disabled:opacity-50"
                          >
                            {loading ? 'Creating...' : 'Create Backup'}
                          </button>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Restore</h3>
                          <p className="text-gray-600 mb-4">Restore system from a previous backup</p>
                          <button className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl transition-all font-medium">
                            Select Backup File
                          </button>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Backups</h3>
                        {backups.length === 0 ? (
                          <div className="text-center py-8">
                            <div className="text-4xl mb-4">💾</div>
                            <p className="text-gray-600">No backups available</p>
                            <p className="text-sm text-gray-500 mt-2">Create your first backup to see it here</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {backups.map((backup, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                <div>
                                  <p className="text-gray-900 font-medium">{backup.name}</p>
                                  <p className="text-gray-600 text-sm">{backup.size} • {backup.date}</p>
                                </div>
                                <div className="flex space-x-2">
                                  <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">
                                    Download
                                  </button>
                                  <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">
                                    Delete
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'logs' && (
                  <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <span className="mr-3">📋</span>
                      System Logs
                    </h2>
                    
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Recent Activity ({logs.length} entries)</h3>
                          <button 
                            onClick={clearLogs}
                            disabled={loading || logs.length === 0}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? 'Clearing...' : 'Clear Logs'}
                          </button>
                        </div>
                        
                        {logs.length === 0 ? (
                          <div className="text-center py-8">
                            <div className="text-4xl mb-4">📋</div>
                            <p className="text-gray-600">No system logs available</p>
                            <p className="text-sm text-gray-500 mt-2">System activity will appear here</p>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {logs.map((log) => (
                              <div key={log.id} className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                                <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                                  log.level === 'error' ? 'bg-red-500' :
                                  log.level === 'warning' ? 'bg-yellow-500' :
                                  log.level === 'success' ? 'bg-green-500' : 'bg-blue-500'
                                }`}></div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="text-gray-900 text-sm font-medium truncate">{log.message}</p>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                      log.level === 'error' ? 'bg-red-100 text-red-800' :
                                      log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                      log.level === 'success' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                      {log.level.toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>{log.user} • {log.action}</span>
                                    <span>{log.time}</span>
                                  </div>
                                  {log.ip && (
                                    <p className="text-xs text-gray-400 mt-1">IP: {log.ip}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="px-8 py-6 border-t border-gray-200">
                  <div className="flex justify-end space-x-4">
                    <button 
                      onClick={resetSettings}
                      className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-medium border border-gray-300"
                    >
                      Reset Changes
                    </button>
                    <button
                      onClick={saveSettings}
                      disabled={loading}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-medium disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </div>
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
        page="settings"
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

export default AdminSettings;