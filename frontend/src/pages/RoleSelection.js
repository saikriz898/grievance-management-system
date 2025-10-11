import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BrandedLoader from '../components/BrandedLoader';

const RoleSelection = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <BrandedLoader message="Loading role selection..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-32">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <span className="text-white text-4xl">👥</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Choose Your Role
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Select your role to access the appropriate login portal
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* User Access */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all group"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-4xl">🎓</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">User Access</h3>
              <p className="text-gray-600 mb-6">For students, faculty, and staff members</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center text-gray-700">
                <span className="mr-3 text-green-500">✓</span>
                <span>Submit and track grievances</span>
              </div>
              <div className="flex items-center text-gray-700">
                <span className="mr-3 text-green-500">✓</span>
                <span>Real-time status updates</span>
              </div>
              <div className="flex items-center text-gray-700">
                <span className="mr-3 text-green-500">✓</span>
                <span>AI-powered assistance</span>
              </div>
            </div>

            <Link
              to="/user-access"
              className="block w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl text-center transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span className="flex items-center justify-center">
                <span className="mr-2">🚀</span>
                Access User Portal
              </span>
            </Link>
          </motion.div>

          {/* Admin Access */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-red-900 to-red-800 rounded-3xl p-8 shadow-xl border border-red-700 hover:shadow-2xl transition-all group"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-4xl">👑</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Administrative Access</h3>
              <p className="text-red-200 mb-6">Restricted access for system administrators</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center text-red-200">
                <span className="mr-3 text-red-400">⚡</span>
                <span>Full system management</span>
              </div>
              <div className="flex items-center text-red-200">
                <span className="mr-3 text-red-400">⚡</span>
                <span>User & role management</span>
              </div>
              <div className="flex items-center text-red-200">
                <span className="mr-3 text-red-400">⚡</span>
                <span>Advanced analytics</span>
              </div>
            </div>

            <Link
              to="/admin-access"
              className="block w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-2xl text-center transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span className="flex items-center justify-center">
                <span className="mr-2">🔒</span>
                Admin Portal
              </span>
            </Link>
          </motion.div>
        </div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            <span className="mr-2">←</span>
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default RoleSelection;