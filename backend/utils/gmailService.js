const { google } = require('googleapis');

class GmailService {
  constructor() {
    this.gmail = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      let credentials;
      
      // Try to get credentials from environment variable first
      if (process.env.GOOGLE_CREDENTIALS) {
        try {
          credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
        } catch (e) {
          console.log('Invalid GOOGLE_CREDENTIALS format');
        }
      }
      
      // Fallback to keyFile if env var not available
      if (!credentials && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        try {
          credentials = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
        } catch (e) {
          console.log('Could not load credentials file');
        }
      }
      
      if (!credentials) {
        console.log('Gmail credentials not found - Email notifications disabled');
        return;
      }

      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/gmail.send']
      });
      
      this.gmail = google.gmail({ version: 'v1', auth });
      this.initialized = true;
      console.log('✅ Gmail service initialized successfully');
    } catch (error) {
      console.error('Gmail service initialization failed:', error.message);
    }
  }

  async sendEmail(to, subject, body) {
    if (!this.initialized) await this.initialize();
    if (!this.gmail) return false;

    try {
      const message = [
        `To: ${to}`,
        `Subject: ${subject}`,
        '',
        body
      ].join('\n');

      const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encodedMessage }
      });

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