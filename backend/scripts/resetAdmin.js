const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('No admin user found. Creating new admin...');
      const newAdmin = await User.create({
        name: process.env.ADMIN_NAME || 'System Administrator',
        phone: process.env.ADMIN_PHONE || '9999999999',
        password: process.env.ADMIN_PASSWORD || 'changeMe123!',
        role: 'admin',
        idNumber: process.env.ADMIN_ID || 'ADMIN001',
        department: process.env.ADMIN_DEPT || 'IT Administration'
      });
      console.log('Admin created with ID:', newAdmin.idNumber);
      console.log('Password:', process.env.ADMIN_PASSWORD || 'changeMe123!');
    } else {
      // Update admin password
      admin.password = process.env.ADMIN_PASSWORD || 'changeMe123!';
      admin.idNumber = process.env.ADMIN_ID || 'ADMIN001';
      await admin.save();
      console.log('Admin password reset successfully');
      console.log('Admin ID:', admin.idNumber);
      console.log('Password:', process.env.ADMIN_PASSWORD || 'changeMe123!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
};

resetAdmin();