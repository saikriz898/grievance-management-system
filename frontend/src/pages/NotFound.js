import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center px-4 py-8 pt-24">
      <div className="text-center max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="mb-8"
        >
          <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            404
          </h1>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">
            Oops! Page Not Found
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
            The page you're looking for seems to have wandered off. 
            Let's get you back on track! 🚀
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center max-w-md mx-auto">
            <button
              onClick={() => navigate('/')}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl sm:rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              🏠 Go Home
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-700 border-2 border-gray-300 rounded-xl sm:rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-400 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              ← Go Back
            </button>
          </div>
          
          <div className="mt-8 sm:mt-12">
            <p className="text-gray-500 mb-4 sm:mb-6 text-base sm:text-lg">Or try these popular pages:</p>
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center max-w-lg mx-auto">
              <button
                onClick={() => navigate('/track')}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-100 text-blue-700 rounded-lg sm:rounded-xl hover:bg-blue-200 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1 text-sm sm:text-base"
              >
                📍 Track Grievance
              </button>
              <button
                onClick={() => navigate('/role-selection')}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-green-100 text-green-700 rounded-lg sm:rounded-xl hover:bg-green-200 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1 text-sm sm:text-base"
              >
                🔐 Login
              </button>
              <button
                onClick={() => navigate('/role-selection')}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-purple-100 text-purple-700 rounded-lg sm:rounded-xl hover:bg-purple-200 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1 text-sm sm:text-base"
              >
                📝 Register
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-16"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <span className="text-white text-3xl font-bold">G</span>
          </div>
          <p className="text-gray-500 text-lg">
            Need help? <span className="font-semibold text-blue-600">GrievAI</span> is always ready to assist!
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;