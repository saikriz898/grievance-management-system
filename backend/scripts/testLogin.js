const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const user = await User.findOne({ idNumber: 'ADMIN001' }).select('+password');
    if (!user) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:');
    console.log('ID:', user.idNumber);
    console.log('Role:', user.role);
    
    const isMatch = await user.comparePassword('changeMe123!');
    console.log('Password test:', isMatch ? '✅ CORRECT' : '❌ WRONG');
    
    if (!isMatch) {
      console.log('Fixing password...');
      user.password = 'changeMe123!';
      await user.save();
      console.log('✅ Password fixed');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
};

testLogin();