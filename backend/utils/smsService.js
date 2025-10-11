let client = null;

// Initialize Twilio client only if credentials are provided and valid
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
  // Validate Twilio Account SID format
  if (process.env.TWILIO_ACCOUNT_SID.startsWith('AC') && process.env.TWILIO_ACCOUNT_SID.length === 34) {
    try {
      const twilio = require('twilio');
      client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      console.log('✅ Twilio SMS service initialized');
    } catch (error) {
      console.log('⚠️ Twilio initialization failed:', error.message);
    }
  } else {
    console.log('⚠️ Invalid Twilio Account SID format - SMS disabled');
  }
} else {
  console.log('⚠️ Twilio credentials not provided - SMS disabled');
}

const sendSMS = async (phoneNumber, message) => {
  if (!client) {
    console.log('📱 SMS would be sent:', { phoneNumber, message });
    return { success: true, messageId: 'mock-id', mock: true };
  }

  try {
    // Ensure phone number is in correct format (+country code)
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });
    
    console.log(`SMS sent to ${formattedPhone}: ${result.sid}`);
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('SMS sending failed:', error);
    return { success: false, error: error.message };
  }
};

const sendGrievanceNotification = async (userPhone, grievanceId, status) => {
  const messages = {
    submitted: `Your grievance #${grievanceId} has been submitted successfully. Track it using this ID.`,
    in_progress: `Update: Your grievance #${grievanceId} is now being reviewed.`,
    resolved: `Good news! Your grievance #${grievanceId} has been resolved.`,
    rejected: `Your grievance #${grievanceId} has been rejected. Contact admin for details.`
  };
  
  const message = messages[status] || `Your grievance #${grievanceId} status updated.`;
  return await sendSMS(userPhone, message);
};

module.exports = { sendSMS, sendGrievanceNotification };