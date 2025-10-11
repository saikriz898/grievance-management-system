import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';


const AdminLanding = () => {
  const [adminCode, setAdminCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const ADMIN_CODE = 'GRIEV2024ADMIN'; // Admin access code

  const handleAdminAccess = () => {
    if (!adminCode.trim()) {
      toast.error('Please enter admin code');
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      if (adminCode === ADMIN_CODE) {
        toast.success('Admin access granted!');
        navigate('/admin/login');
      } else {
        toast.error('Invalid admin code');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 pt-32">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-700 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <span className="text-white text-4xl">⚡</span>
          </div>
          <h1 className="text-6xl font-bold text-white mb-6">
            Admin Control Center
          </h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
            Secure administrative access to manage grievances, users, and system settings with advanced controls and analytics.
          </p>
        </motion.div>

        {/* Admin Access Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-md mx-auto mb-16"
        >
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-red-400 text-2xl">🔐</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Secure Access</h3>
              <p className="text-blue-200">Enter admin code to continue</p>
            </div>
            
            <div className="space-y-6">
              <input
                type="password"
                placeholder="Enter Admin Code"
                className="w-full px-6 py-4 text-lg bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-400 transition-all"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminAccess()}
              />
              
              <button
                onClick={handleAdminAccess}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-2xl transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">⏳</span>
                    Verifying Access...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <span className="mr-2">🚀</span>
                    Access Admin Panel
                  </span>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-blue-400 text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Analytics Dashboard</h3>
            <p className="text-blue-200">Comprehensive insights and reporting tools for grievance management</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-green-400 text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">User Management</h3>
            <p className="text-blue-200">Complete control over user accounts, roles, and permissions</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-purple-400 text-2xl">⚙️</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">System Settings</h3>
            <p className="text-blue-200">Advanced configuration and system maintenance tools</p>
          </div>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center"
        >
          <div className="flex items-center justify-center space-x-2 text-red-400 mb-2">
            <span>🔒</span>
            <span className="font-semibold">Security Notice</span>
          </div>
          <p className="text-red-200 text-sm">
            This is a restricted area. All access attempts are logged and monitored. 
            Unauthorized access is strictly prohibited.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLanding;