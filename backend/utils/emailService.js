// Alternative email service using nodemailer (fallback)
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Use Gmail SMTP as fallback
      if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        this.transporter = nodemailer.createTransporter({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
          }
        });
        
        this.initialized = true;
        console.log('✅ Email service (SMTP) initialized successfully');
      } else {
        console.log('⚠️ Email service credentials not found');
      }
    } catch (error) {
      console.error('Email service initialization failed:', error.message);
    }
  }

  async sendEmail(to, subject, text) {
    if (!this.initialized) await this.initialize();
    if (!this.transporter) return false;

    try {
      await this.transporter.sendMail({
        from: process.env.GMAIL_USER,
        to,
        subject,
        text
      });
      
      console.log(`Email sent to ${to}: ${subject}`);
      return true;
    } catch (error) {
      console.error('Email send error:', error.message);
      return false;
    }
  }

  async sendRegistrationWelcome(user) {
    const subject = `Welcome to GrievAI - Registration Successful`;
    const text = `Dear ${user.name},

Welcome to GrievAI! Your account has been successfully created.

Account Details:
- User ID: ${user.idNumber}
- Role: ${user.role.toUpperCase()}
- Email: ${user.email}

Login: ${process.env.FRONTEND_URL}/user/login-selection

Best regards,
GrievAI Team`;

    return await this.sendEmail(user.email, subject, text);
  }
}

module.exports = new EmailService();