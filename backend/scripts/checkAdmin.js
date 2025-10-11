const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const admin = await User.findOne({ role: 'admin' }).select('+password');
    if (admin) {
      console.log('Admin found:');
      console.log('ID Number:', admin.idNumber);
      console.log('Name:', admin.name);
      console.log('Phone:', admin.phone);
      console.log('Role:', admin.role);
      
      // Test password
      const testPassword = 'changeMe123!';
      const isMatch = await admin.comparePassword(testPassword);
      console.log('Password test result:', isMatch);
      
      if (!isMatch) {
        console.log('Updating password...');
        admin.password = testPassword;
        await admin.save();
        console.log('Password updated successfully');
      }
    } else {
      console.log('No admin found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
};

checkAdmin();