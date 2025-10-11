import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import api from '../utils/api';

const UserRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    idNumber: '',
    department: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.password || !formData.idNumber) {
      toast.error('Please fill all required fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        idNumber: formData.idNumber,
        department: formData.department
      });
      
      if (response.data.success) {
        login(response.data.user, response.data.token);
        toast.success('Registration successful!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-32">
      <div className="max-w-md mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-3xl">📝</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600">Join the GrievAI community</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-3">
                👤 Full Name *
              </label>
              <input
                name="name"
                type="text"
                required
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-3">
                📱 Phone Number *
              </label>
              <input
                name="phone"
                type="tel"
                required
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-3">
                  🔑 Password *
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-3">
                  🔑 Confirm *
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Confirm"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-3">
                👥 Role *
              </label>
              <select
                name="role"
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">🎓 Student</option>
                <option value="faculty">👨‍🏫 Faculty</option>
                <option value="staff">👔 Staff</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-3">
                🆔 ID Number *
              </label>
              <input
                name="idNumber"
                type="text"
                required
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="Enter your ID number"
                value={formData.idNumber}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-3">
                🏢 Department
              </label>
              <input
                name="department"
                type="text"
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="Enter your department (optional)"
                value={formData.department}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <span className="mr-2">🚀</span>
                  Create Account
                </span>
              )}
            </button>

            <div className="text-center pt-4 border-t border-gray-200 space-y-3">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <Link to="/user/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign in
                </Link>
              </p>
              <div className="flex justify-center space-x-4 text-sm">
                <Link to="/" className="text-gray-500 hover:text-gray-700 transition-colors">
                  ← Back to Home
                </Link>
                <Link to="/role-selection" className="text-blue-600 hover:text-blue-800 transition-colors">
                  Change Role
                </Link>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default UserRegister;