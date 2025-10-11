import React from 'react';
import { motion } from 'framer-motion';

const BrandedLoader = ({ message = "Loading...", size = "large" }) => {
  const isSmall = size === "small";
  
  return (
    <div className={`${isSmall ? 'p-4' : 'fixed inset-0'} bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center z-50`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        {/* Animated Logo */}
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.5, repeat: Infinity }
          }}
          className={`${isSmall ? 'w-12 h-12' : 'w-20 h-20'} bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl`}
        >
          <span className={`text-white font-black ${isSmall ? 'text-xl' : 'text-3xl'}`}>G</span>
        </motion.div>

        {/* Brand Name with Gradient */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`${isSmall ? 'text-xl' : 'text-4xl'} font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3`}
        >
          GrievAI
        </motion.h1>

        {/* Loading Message */}
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={`text-gray-600 font-medium ${isSmall ? 'text-sm' : 'text-lg'} mb-4`}
        >
          {message}
        </motion.p>

        {/* Animated Dots */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                y: [0, -8, 0],
                backgroundColor: ['#3B82F6', '#6366F1', '#8B5CF6', '#3B82F6']
              }}
              transition={{
                y: { duration: 0.6, repeat: Infinity, delay: i * 0.2 },
                backgroundColor: { duration: 2, repeat: Infinity }
              }}
              className={`${isSmall ? 'w-2 h-2' : 'w-3 h-3'} bg-blue-500 rounded-full`}
            />
          ))}
        </div>

        {/* Pulse Ring Animation */}
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`${isSmall ? 'w-16 h-16 -mt-8' : 'w-24 h-24 -mt-12'} border-2 border-blue-400 rounded-full absolute`}
        />
      </motion.div>
    </div>
  );
};

export default BrandedLoader;