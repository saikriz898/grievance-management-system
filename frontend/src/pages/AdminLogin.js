import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import api from '../utils/api';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    idNumber: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.idNumber || !formData.password) {
      toast.error('Please fill all fields');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        identifier: formData.idNumber,
        password: formData.password
      });
      
      if (response.data.success) {
        const user = response.data.user;
        
        if (user.role !== 'admin') {
          toast.error('Access denied. Admin privileges required.');
          setFormData(prev => ({ ...prev, password: '' }));
          setLoading(false);
          return;
        }
        
        console.log('Admin login successful, user:', user);
        login(user, response.data.token);
        toast.success('Admin login successful!');
        
        // Direct navigation without page reload
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (error) {
      // Show specific error messages
      const errorMessage = error.response?.data?.message || 'Login failed';
      
      if (errorMessage.toLowerCase().includes('invalid credentials')) {
        toast.error('Invalid admin ID or password. Please check your credentials.');
      } else if (errorMessage.toLowerCase().includes('user not found')) {
        toast.error('Admin ID not found. Please check your admin ID.');
      } else if (errorMessage.toLowerCase().includes('password')) {
        toast.error('Incorrect password. Please try again.');
      } else {
        toast.error(errorMessage);
      }
      
      // Only clear password field, keep username
      setFormData(prev => ({ ...prev, password: '' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-red-800 pt-32">
      <div className="max-w-md mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-red-400 text-3xl">👑</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Admin Login</h2>
            <p className="text-red-200">Secure administrative access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-red-200 text-sm font-medium mb-3">
                🆔 Admin ID Number
              </label>
              <input
                name="idNumber"
                type="text"
                required
                className="w-full px-6 py-4 text-lg bg-white/10 border border-white/20 rounded-2xl text-white placeholder-red-200 focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-400 transition-all"
                placeholder="Enter your admin ID number"
                value={formData.idNumber}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-red-200 text-sm font-medium mb-3">
                🔑 Admin Password
              </label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-6 py-4 text-lg bg-white/10 border border-white/20 rounded-2xl text-white placeholder-red-200 focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-400 transition-all"
                placeholder="Enter admin password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-2xl transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <span className="mr-2">👑</span>
                  Access Admin Panel
                </span>
              )}
            </button>

            <div className="text-center pt-4 border-t border-white/20 space-y-3">
              <div className="flex justify-center space-x-4 text-sm">
                <Link 
                  to="/admin-access" 
                  className="text-red-300 hover:text-white font-medium transition-colors"
                >
                  ← Back to Admin Access
                </Link>
                <Link 
                  to="/" 
                  className="text-red-200 hover:text-white transition-colors"
                >
                  Home
                </Link>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLogin;