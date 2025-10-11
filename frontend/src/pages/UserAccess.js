import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const UserAccess = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-32">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <span className="text-white text-4xl">🎓</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            User Access
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Are you a new user or do you already have an account?
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* New User */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all group"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-4xl">✨</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">New User</h3>
              <p className="text-gray-600 mb-6">Create your first account</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center text-gray-700">
                <span className="mr-3 text-green-500">✓</span>
                <span>Choose your role</span>
              </div>
              <div className="flex items-center text-gray-700">
                <span className="mr-3 text-green-500">✓</span>
                <span>OTP verification</span>
              </div>
              <div className="flex items-center text-gray-700">
                <span className="mr-3 text-green-500">✓</span>
                <span>Complete registration</span>
              </div>
            </div>

            <Link
              to="/user/role-selection"
              className="block w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-2xl text-center transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span className="flex items-center justify-center">
                <span className="mr-2">🚀</span>
                Get Started
              </span>
            </Link>
          </motion.div>

          {/* Existing User */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all group"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-4xl">👤</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Existing User</h3>
              <p className="text-gray-600 mb-6">Sign in to your account</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center text-gray-700">
                <span className="mr-3 text-blue-500">✓</span>
                <span>Select your role</span>
              </div>
              <div className="flex items-center text-gray-700">
                <span className="mr-3 text-blue-500">✓</span>
                <span>OTP verification</span>
              </div>
              <div className="flex items-center text-gray-700">
                <span className="mr-3 text-blue-500">✓</span>
                <span>Access dashboard</span>
              </div>
            </div>

            <Link
              to="/user/login-selection"
              className="block w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl text-center transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span className="flex items-center justify-center">
                <span className="mr-2">🔐</span>
                Sign In
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
            to="/role-selection"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            <span className="mr-2">←</span>
            Back to Role Selection
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default UserAccess;