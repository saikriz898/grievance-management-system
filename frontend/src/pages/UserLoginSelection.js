import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const UserLoginSelection = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-32">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <span className="text-white text-4xl">🔐</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Select Your Role
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Choose your role to sign in to your account
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Student */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all group"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-4xl">🎓</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Student</h3>
              <p className="text-gray-600 mb-6">Sign in as student</p>
            </div>

            <Link
              to="/student/login"
              className="block w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl text-center transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span className="flex items-center justify-center">
                <span className="mr-2">🔐</span>
                Student Login
              </span>
            </Link>
          </motion.div>

          {/* Faculty */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all group"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-4xl">👨🏫</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Faculty</h3>
              <p className="text-gray-600 mb-6">Sign in as faculty</p>
            </div>

            <Link
              to="/faculty/login"
              className="block w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-2xl text-center transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span className="flex items-center justify-center">
                <span className="mr-2">🔐</span>
                Faculty Login
              </span>
            </Link>
          </motion.div>

          {/* Staff */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all group"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-4xl">👔</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Staff</h3>
              <p className="text-gray-600 mb-6">Sign in as staff</p>
            </div>

            <Link
              to="/staff/login"
              className="block w-full py-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold rounded-2xl text-center transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span className="flex items-center justify-center">
                <span className="mr-2">🔐</span>
                Staff Login
              </span>
            </Link>
          </motion.div>
        </div>

        {/* Back */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Link
            to="/user-access"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            <span className="mr-2">←</span>
            Back to User Access
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default UserLoginSelection;