import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';

// Role-specific configuration
const roleConfig = {
  student: {
    title: 'Student Registration',
    icon: '🎓',
    idLabel: 'Student ID',
    idPlaceholder: 'Enter your student ID',
    loginLink: '/student/login',
    otpMessage: 'Welcome to GrievAI! Your registration verification code is: {otp}. Valid for 5 minutes.',
    gradient: {
      bg: 'from-slate-50 via-blue-50 to-indigo-50',
      icon: 'from-blue-600 to-indigo-700',
      button: 'from-blue-600 to-indigo-600',
      buttonHover: 'hover:from-blue-700 hover:to-indigo-700',
      progress: 'bg-blue-600',
      progressStep: 'bg-blue-600',
      focus: 'focus:ring-blue-500/20 focus:border-blue-500',
      link: 'text-blue-600 hover:text-blue-800'
    }
  },
  faculty: {
    title: 'Faculty Registration',
    icon: '👨‍🏫',
    idLabel: 'Faculty ID',
    idPlaceholder: 'Enter your faculty ID',
    loginLink: '/faculty/login',
    otpMessage: 'Welcome to GrievAI Faculty Portal! Your verification code is: {otp}. Valid for 5 minutes.',
    gradient: {
      bg: 'from-green-50 via-emerald-50 to-teal-50',
      icon: 'from-green-600 to-emerald-700',
      button: 'from-green-600 to-emerald-600',
      buttonHover: 'hover:from-green-700 hover:to-emerald-700',
      progress: 'bg-green-600',
      progressStep: 'bg-green-600',
      focus: 'focus:ring-green-500/20 focus:border-green-500',
      link: 'text-green-600 hover:text-green-800'
    }
  },
  staff: {
    title: 'Staff Registration',
    icon: '👔',
    idLabel: 'Staff ID',
    idPlaceholder: 'Enter your staff ID',
    loginLink: '/staff/login',
    otpMessage: 'Welcome to GrievAI Staff Portal! Your verification code is: {otp}. Valid for 5 minutes.',
    gradient: {
      bg: 'from-purple-50 via-violet-50 to-indigo-50',
      icon: 'from-purple-600 to-violet-700',
      button: 'from-purple-600 to-violet-600',
      buttonHover: 'hover:from-purple-700 hover:to-violet-700',
      progress: 'bg-purple-600',
      progressStep: 'bg-purple-600',
      focus: 'focus:ring-purple-500/20 focus:border-purple-500',
      link: 'text-purple-600 hover:text-purple-800'
    }
  }
};

const RoleBasedRegister = ({ role }) => {
  const config = roleConfig[role];
  const [step, setStep] = useState(1); // 1: Basic Info, 2: OTP, 3: Complete Info
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    otp: '',
    password: '',
    confirmPassword: '',
    email: '',
    idNumber: '',
    department: ''
  });
  const [loading, setLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.phone) {
      toast.error('Please fill all required fields');
      return false;
    }
    if (formData.phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return false;
    }
    return true;
  };

  const sendRegisterOTP = async () => {
    if (!validateStep1()) return;
    
    setLoading(true);
    try {
      const response = await api.post('/otp/send', { 
        phone: formData.phone,
        type: 'register',
        message: config.otpMessage
      });
      
      if (response.data.success) {
        toast.success('Registration OTP sent to your phone');
        setStep(2);
        setOtpTimer(300);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      toast.error('Please enter valid 6-digit OTP');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/otp/verify', { 
        phone: formData.phone, 
        otp: formData.otp 
      });
      
      if (response.data.success) {
        toast.success('Phone verified successfully');
        setStep(3);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const validateStep3 = () => {
    if (!formData.password || !formData.confirmPassword || !formData.email || !formData.idNumber) {
      toast.error('Please fill all required fields');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateStep3()) return;
    
    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        role: role,
        idNumber: formData.idNumber,
        department: formData.department
      });
      
      if (response.data.success) {
        toast.success('Registration successful! Please login to continue.');
        navigate(config.loginLink);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = () => {
    switch(step) {
      case 1: return '👤';
      case 2: return '📱';
      case 3: return '🔐';
      default: return '👤';
    }
  };

  const getStepTitle = () => {
    switch(step) {
      case 1: return 'Basic Information';
      case 2: return 'Verify Phone';
      case 3: return 'Complete Registration';
      default: return 'Register';
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.gradient.bg} pt-32`}>
      <div className="max-w-md mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-2xl"
        >
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              {[1, 2, 3].map((num) => (
                <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= num ? `${config.gradient.progressStep} text-white` : 'bg-gray-200 text-gray-600'
                }`}>
                  {num}
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`${config.gradient.progress} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className={`w-20 h-20 bg-gradient-to-br ${config.gradient.icon} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
              <span className="text-white text-3xl">{getStepIcon()}</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{config.title}</h2>
            <p className="text-gray-600">{getStepTitle()}</p>
            <p className="text-sm text-gray-500 mt-1">Step {step} of 3</p>
          </div>

          <div className="space-y-6">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-3">
                    👤 Full Name *
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    className={`w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 ${config.gradient.focus} transition-all`}
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
                    className={`w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 ${config.gradient.focus} transition-all`}
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <button
                  onClick={sendRegisterOTP}
                  disabled={loading}
                  className={`w-full py-4 bg-gradient-to-r ${config.gradient.button} ${config.gradient.buttonHover} text-white font-bold rounded-2xl transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none flex items-center justify-center`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Sending OTP...
                    </>
                  ) : '📱 Send OTP'}
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-3">
                    📱 Enter OTP
                  </label>
                  <input
                    name="otp"
                    type="text"
                    maxLength="6"
                    className={`w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 ${config.gradient.focus} text-center tracking-widest`}
                    placeholder="000000"
                    value={formData.otp}
                    onChange={handleChange}
                  />
                  <p className="text-sm text-gray-500 mt-2">OTP sent to {formData.phone}</p>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <button
                    onClick={() => setStep(1)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    ← Back
                  </button>
                  <span className="text-gray-500">
                    {otpTimer > 0 ? `${Math.floor(otpTimer/60)}:${(otpTimer%60).toString().padStart(2,'0')}` : (
                      <button onClick={sendRegisterOTP} className={config.gradient.link}>
                        Resend OTP
                      </button>
                    )}
                  </span>
                </div>
                <button
                  onClick={verifyOTP}
                  disabled={loading}
                  className={`w-full py-4 bg-gradient-to-r ${config.gradient.button} ${config.gradient.buttonHover} text-white font-bold rounded-2xl transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none flex items-center justify-center`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Verifying...
                    </>
                  ) : '✓ Verify OTP'}
                </button>
              </>
            )}

            {step === 3 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-3">
                      🔑 Password *
                    </label>
                    <input
                      name="password"
                      type="password"
                      required
                      className={`w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 ${config.gradient.focus} transition-all`}
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
                      className={`w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 ${config.gradient.focus} transition-all`}
                      placeholder="Confirm"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-3">
                    📧 Email Address *
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    className={`w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 ${config.gradient.focus} transition-all`}
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-3">
                    🆔 {config.idLabel} *
                  </label>
                  <input
                    name="idNumber"
                    type="text"
                    required
                    className={`w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 ${config.gradient.focus} transition-all`}
                    placeholder={config.idPlaceholder}
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
                    className={`w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 ${config.gradient.focus} transition-all`}
                    placeholder="Enter your department (optional)"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-2xl transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleRegister}
                    disabled={loading}
                    className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-2xl transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Creating...
                      </>
                    ) : '🚀 Create Account'}
                  </button>
                </div>
              </>
            )}

            <div className="text-center pt-4 border-t border-gray-200 space-y-3">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <Link to={config.loginLink} className={`${config.gradient.link} font-medium`}>
                  Sign in
                </Link>
              </p>
              <div className="flex justify-center space-x-4 text-sm">
                <Link to="/user/role-selection" className="text-gray-500 hover:text-gray-700 transition-colors">
                  ← Back to Role Selection
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RoleBasedRegister;
