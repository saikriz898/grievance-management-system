import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import api from '../utils/api';

const FacultyLogin = () => {
  const [step, setStep] = useState(1); // 1: Login, 2: Forgot Password, 3: Reset Password
  const [formData, setFormData] = useState({
    idNumber: '',
    password: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [resetPhone, setResetPhone] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendResetOTP = async () => {
    if (!resetPhone) {
      toast.error('Please enter your phone number');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/otp/send', {
        phone: resetPhone,
        type: 'reset',
        message: `Your password reset code is: {otp}. Valid for 5 minutes.`
      });
      
      if (response.data.success) {
        toast.success('Reset OTP sent to your phone');
        setFormData({ ...formData, phone: resetPhone });
        setStep(3);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset OTP');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!formData.otp || !formData.newPassword || !formData.confirmPassword) {
      toast.error('Please fill all fields');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      const otpResponse = await api.post('/otp/verify', {
        phone: formData.phone,
        otp: formData.otp
      });
      
      if (otpResponse.data.success) {
        const resetResponse = await api.post('/auth/reset-password', {
          phone: formData.phone,
          newPassword: formData.newPassword
        });
        
        if (resetResponse.data.success) {
          toast.success('Password reset successful! Please login with your new password.');
          setStep(1);
          setFormData({ phone: formData.phone, password: '', otp: '', newPassword: '', confirmPassword: '' });
          setResetPhone('');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
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
        
        if (user.role !== 'faculty') {
          toast.error('This login is for faculty only');
          return;
        }
        
        login(user, response.data.token);
        toast.success('Login successful!');
        navigate('/dashboard');
      }
    } catch (error) {
      // Show specific error messages
      const errorMessage = error.response?.data?.message || 'Login failed';
      
      if (errorMessage.toLowerCase().includes('invalid credentials')) {
        toast.error('Invalid faculty ID or password. Please check your credentials.');
      } else if (errorMessage.toLowerCase().includes('user not found')) {
        toast.error('Faculty ID not found. Please check your faculty ID.');
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pt-32">
      <div className="max-w-md mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-3xl">👨‍🏫</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Faculty Login</h2>
            <p className="text-gray-600">Sign in to your faculty account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-3">
                🆔 Faculty ID Number
              </label>
              <input
                name="idNumber"
                type="text"
                required
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all"
                placeholder="Enter your faculty ID number"
                value={formData.idNumber}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-3">
                🔑 Password
              </label>
              <input
                name="password"
                type="password"
                required
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-2xl transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <span className="mr-2">🚀</span>
                  Sign In
                </span>
              )}
            </button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                Forgot Password?
              </button>
            </div>
          </form>

          {step === 2 && (
            <div className="space-y-6 mt-8">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Reset Password</h3>
                <p className="text-gray-600 text-sm">Enter your phone number to receive reset OTP</p>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-3">
                  📱 Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all"
                  placeholder="Enter your phone number"
                  value={resetPhone}
                  onChange={(e) => setResetPhone(e.target.value)}
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-2xl transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={sendResetOTP}
                  disabled={loading || !resetPhone}
                  className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Sending...
                    </>
                  ) : 'Send OTP'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 mt-8">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Create New Password</h3>
                <p className="text-gray-600 text-sm">Enter OTP and your new password</p>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-3">
                  📱 Enter OTP
                </label>
                <input
                  name="otp"
                  type="text"
                  maxLength="6"
                  className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 text-center tracking-widest"
                  placeholder="000000"
                  value={formData.otp}
                  onChange={handleChange}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-3">
                    🔑 New Password
                  </label>
                  <input
                    name="newPassword"
                    type="password"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all"
                    placeholder="New Password"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-3">
                    🔑 Confirm
                  </label>
                  <input
                    name="confirmPassword"
                    type="password"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all"
                    placeholder="Confirm"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-2xl transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={resetPassword}
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Resetting...
                    </>
                  ) : '🔄 Reset Password'}
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="text-center pt-4 border-t border-gray-200 space-y-3">
              <p className="text-gray-600 text-sm">
                New faculty member?{' '}
                <Link to="/faculty/register" className="text-green-600 hover:text-green-800 font-medium">
                  Create account
                </Link>
              </p>
              <div className="flex justify-center space-x-4 text-sm">
                <Link to="/user/login-selection" className="text-gray-500 hover:text-gray-700 transition-colors">
                  ← Back to Login Selection
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default FacultyLogin;