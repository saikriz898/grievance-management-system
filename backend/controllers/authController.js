const User = require('../models/User');
const { validationResult } = require('express-validator');
const Logger = require('../utils/logger');
const LoginMonitor = require('../utils/loginMonitor');
const gmailService = require('../utils/gmailService');

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, phone, email, password, role, idNumber, department } = req.body;

    const existingUser = await User.findOne({ idNumber });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this ID number already exists. Please use a different ID number or login instead.' 
      });
    }

    const user = await User.create({
      name,
      phone,
      email,
      password,
      role,
      idNumber,
      department
    });

    await Logger.success(`New user registered: ${name} (${idNumber})`, 'USER_REGISTER', user._id, req, { role, department });

    // Send registration welcome email
    try {
      if (user.email) {
        await gmailService.sendRegistrationWelcome(user);
      }
    } catch (emailError) {
      console.log('Registration email notification failed:', emailError.message);
    }

    const token = user.generateToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        idNumber: user.idNumber,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide ID number and password'
      });
    }

    const user = await User.findOne({ idNumber: identifier }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      await Logger.warning(`Failed login attempt for ID: ${identifier}`, 'LOGIN_FAILED', null, req);
      await LoginMonitor.recordLogin(user?._id, req, false, 'Invalid credentials');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    await Logger.success(`User logged in: ${user.name} (${user.idNumber})`, 'LOGIN_SUCCESS', user._id, req, { role: user.role });
    await LoginMonitor.recordLogin(user._id, req, true);

    const token = user.generateToken();

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        idNumber: user.idNumber,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { phone, newPassword } = req.body;

    if (!phone || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone and new password are required' 
      });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    user.password = newPassword;
    await user.save();

    await Logger.info(`Password reset for user: ${user.name} (${user.idNumber})`, 'PASSWORD_RESET', user._id, req);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, department, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Update basic info
    if (name) user.name = name;
    if (department !== undefined) user.department = department;

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ 
          success: false, 
          message: 'Current password is required to change password' 
        });
      }

      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ 
          success: false, 
          message: 'Current password is incorrect' 
        });
      }

      user.password = newPassword;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        idNumber: user.idNumber,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe, resetPassword, updateProfile };