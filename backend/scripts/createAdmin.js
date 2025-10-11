const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.phone);
      return;
    }

    // Create admin user
    const admin = await User.create({
      name: process.env.ADMIN_NAME || 'System Administrator',
      phone: process.env.ADMIN_PHONE || '9999999999',
      password: process.env.ADMIN_PASSWORD || 'changeMe123!',
      role: 'admin',
      idNumber: process.env.ADMIN_ID || 'ADMIN001',
      department: process.env.ADMIN_DEPT || 'IT Administration'
    });

    console.log('Admin created successfully:');
    console.log('Phone:', admin.phone);
    console.log('Password: [HIDDEN]');
    console.log('Role:', admin.role);
    
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    mongoose.disconnect();
  }
};

createAdmin();