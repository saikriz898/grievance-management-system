const nodemailer = require('nodemailer');

class GmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Use SMTP instead of Gmail API to avoid decoder issues
      if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        this.transporter = nodemailer.createTransporter({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
          }
        });
        
        // Test connection
        await this.transporter.verify();
        this.initialized = true;
        console.log('✅ Gmail SMTP service initialized successfully');
      } else {
        console.log('⚠️ Gmail SMTP credentials not found - Email notifications disabled');
      }
    } catch (error) {
      console.error('Gmail SMTP service initialization failed:', error.message);
    }
  }

  async sendEmail(to, subject, body) {
    if (!this.initialized) await this.initialize();
    if (!this.transporter) return false;

    try {
      await this.transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: to,
        subject: subject,
        text: body
      });

      console.log(`Email sent to ${to}: ${subject}`);
      return true;
    } catch (error) {
      console.error('Gmail send error:', error.message);
      return false;
    }
  }

  async sendGrievanceNotification(grievance, user, type = 'submitted') {
    const subjects = {
      submitted: `Grievance Submitted - ${grievance.trackingId}`,
      updated: `Grievance Updated - ${grievance.trackingId}`,
      resolved: `Grievance Resolved - ${grievance.trackingId}`
    };

    const body = `
Dear ${user.name},

Your grievance has been ${type}.

Tracking ID: ${grievance.trackingId}
Title: ${grievance.title}
Status: ${grievance.status}
Priority: ${grievance.priority}

You can track your grievance at: ${process.env.FRONTEND_URL}/track

Best regards,
GrievAI System
    `;

    return await this.sendEmail(user.email, subjects[type], body);
  }

  async sendRegistrationWelcome(user) {
    const subject = `Welcome to GrievAI - Registration Successful`;
    
    const body = `
Dear ${user.name},

Welcome to GrievAI! Your account has been successfully created.

Account Details:
- User ID: ${user.idNumber}
- Role: ${user.role.toUpperCase()}
- Department: ${user.department || 'Not specified'}
- Email: ${user.email}

You can now:
- Submit grievances and track their progress
- Access your personalized dashboard
- Receive updates on your submissions

Login to your account: ${process.env.FRONTEND_URL}/user/login-selection

If you have any questions, feel free to contact our support team.

Best regards,
GrievAI Team
    `;

    return await this.sendEmail(user.email, subject, body);
  }

  async sendTrackingNotification(email, trackingId, grievance) {
    const subject = `Grievance Tracking - ${trackingId}`;
    
    const body = `
Grievance Tracking Information

Tracking ID: ${trackingId}
Title: ${grievance.title}
Status: ${grievance.status.toUpperCase()}
Priority: ${grievance.priority.toUpperCase()}
Submitted: ${new Date(grievance.createdAt).toLocaleDateString()}

Description: ${grievance.description.substring(0, 200)}...

Track your grievance: ${process.env.FRONTEND_URL}/track

Best regards,
GrievAI System
    `;

    return await this.sendEmail(email, subject, body);
  }
}

module.exports = new GmailService();