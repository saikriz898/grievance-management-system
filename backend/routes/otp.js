const express = require('express');
const router = express.Router();

// In-memory OTP storage (use Redis in production)
const otpStore = new Map();

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP using Twilio SMS service
async function sendSMS(phone, otp) {
  try {
    const { sendSMS: twilioSMS } = require('../utils/smsService');
    const message = `Your GrievAI OTP is ${otp}. Valid for 5 minutes. Do not share this code.`;
    
    const result = await twilioSMS(phone, message);
    if (!result.success) {
      throw new Error(result.error);
    }
    
    console.log(`OTP sent to ${phone}: ${result.messageId}`);
    return result;
  } catch (error) {
    console.error('SMS sending failed:', error);
    // Fallback to console log for development
    console.log(`SMS to ${phone}: Your GrievAI OTP is ${otp}. Valid for 5 minutes.`);
    return { success: true };
  }
}

// Send OTP endpoint
router.post('/send', async (req, res) => {
  try {
    const { phone } = req.body;
    
    // Validate and sanitize phone number
    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Valid phone number is required'
      });
    }
    
    const sanitizedPhone = phone.replace(/[^0-9+]/g, '');
    if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be 10-15 digits'
      });
    }
    
    const otp = generateOTP();
    const expiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes
    
    // Store OTP with expiry
    otpStore.set(sanitizedPhone, {
      otp,
      expiryTime,
      attempts: 0
    });
    
    // Send SMS
    await sendSMS(sanitizedPhone, otp);
    
    res.json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 300 // 5 minutes in seconds
    });
    
  } catch (error) {
    console.error('OTP send error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
});

// Verify OTP endpoint
router.post('/verify', (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    if (!phone || !otp || typeof phone !== 'string' || typeof otp !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Phone and OTP are required'
      });
    }
    
    const sanitizedPhone = phone.replace(/[^0-9+]/g, '');
    const sanitizedOTP = otp.replace(/[^0-9]/g, '');
    
    if (sanitizedOTP.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be 6 digits'
      });
    }
    
    const storedData = otpStore.get(sanitizedPhone);
    
    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found or expired'
      });
    }
    
    // Check expiry
    if (Date.now() > storedData.expiryTime) {
      otpStore.delete(sanitizedPhone);
      return res.status(400).json({
        success: false,
        message: 'OTP expired'
      });
    }
    
    // Check attempts
    if (storedData.attempts >= 3) {
      otpStore.delete(sanitizedPhone);
      return res.status(400).json({
        success: false,
        message: 'Too many attempts. Request new OTP'
      });
    }
    
    // Verify OTP
    if (storedData.otp !== sanitizedOTP) {
      storedData.attempts++;
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${3 - storedData.attempts} attempts remaining`
      });
    }
    
    // OTP verified successfully
    otpStore.delete(sanitizedPhone);
    
    res.json({
      success: true,
      message: 'OTP verified successfully'
    });
    
  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP'
    });
  }
});

module.exports = router;