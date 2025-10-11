const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const forceCreateAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Delete existing admin
    await User.deleteMany({ role: 'admin' });
    console.log('Deleted existing admin users');
    
    // Create new admin
    const admin = await User.create({
      name: 'System Administrator',
      phone: '9999999999',
      password: 'changeMe123!',
      role: 'admin',
      idNumber: 'ADMIN001',
      department: 'IT Administration'
    });
    
    console.log('Admin created successfully:');
    console.log('ID:', admin.idNumber);
    console.log('Password: changeMe123!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
};

forceCreateAdmin();