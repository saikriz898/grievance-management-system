const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

class GoogleIntegration {
  constructor() {
    this.auth = null;
    this.sheets = null;
    this.gmail = null;
    this.drive = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      let credentials;
      
      // Try to load from environment variable first
      if (process.env.GOOGLE_CREDENTIALS) {
        try {
          credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
        } catch (e) {
          console.log('Invalid GOOGLE_CREDENTIALS format');
        }
      }
      
      // Try to load from file if env var not available
      if (!credentials) {
        const credentialsPath = path.join(__dirname, '../google-credentials.json');
        if (fs.existsSync(credentialsPath)) {
          credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
        }
      }
      
      if (!credentials) {
        console.log('⚠️ Google credentials not found - Google features disabled');
        console.log('To enable Google features:');
        console.log('1. Set GOOGLE_CREDENTIALS environment variable');
        console.log('2. Or place google-credentials.json in backend folder');
        return false;
      }

      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/gmail.send',
          'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/gmail.compose'
        ]
      });

      const authClient = await this.auth.getClient();
      this.sheets = google.sheets({ version: 'v4', auth: authClient });
      this.gmail = google.gmail({ version: 'v1', auth: authClient });
      this.drive = google.drive({ version: 'v3', auth: authClient });
      this.initialized = true;
      console.log('Google integration initialized successfully');
      return true;
    } catch (error) {
      console.error('Google integration initialization failed:', error);
      return false;
    }
  }

  async createGrievanceSheet() {
    if (!this.initialized) return null;

    try {
      const resource = {
        properties: {
          title: `Grievance System - ${new Date().toISOString().split('T')[0]}`
        },
        sheets: [{
          properties: {
            title: 'Grievances'
          },
          data: [{
            rowData: [{
              values: [
                { userEnteredValue: { stringValue: 'Tracking ID' } },
                { userEnteredValue: { stringValue: 'Title' } },
                { userEnteredValue: { stringValue: 'Category' } },
                { userEnteredValue: { stringValue: 'Priority' } },
                { userEnteredValue: { stringValue: 'Status' } },
                { userEnteredValue: { stringValue: 'Submitted By' } },
                { userEnteredValue: { stringValue: 'Department' } },
                { userEnteredValue: { stringValue: 'Created At' } },
                { userEnteredValue: { stringValue: 'Assigned To' } },
                { userEnteredValue: { stringValue: 'Description' } }
              ]
            }]
          }]
        }]
      };

      const response = await this.sheets.spreadsheets.create({ resource });
      const spreadsheetId = response.data.spreadsheetId;
      
      // Make sheet publicly readable
      await this.drive.permissions.create({
        fileId: spreadsheetId,
        resource: {
          role: 'reader',
          type: 'anyone'
        }
      });

      console.log(`Created Google Sheet: ${spreadsheetId}`);
      return spreadsheetId;
    } catch (error) {
      console.error('Failed to create Google Sheet:', error);
      return null;
    }
  }

  async syncToSheets(grievance, sheetId = null) {
    if (!this.initialized) return false;

    try {
      const spreadsheetId = sheetId || process.env.GOOGLE_SHEET_ID;
      if (!spreadsheetId) {
        console.log('No Google Sheet ID configured');
        return false;
      }

      const values = [[
        grievance.trackingId,
        grievance.title,
        grievance.category,
        grievance.priority,
        grievance.status,
        grievance.submittedBy?.name || 'Unknown',
        grievance.submittedBy?.department || 'N/A',
        new Date(grievance.createdAt).toISOString(),
        grievance.assignedTo?.name || 'Unassigned',
        grievance.description?.substring(0, 100) + '...' || ''
      ]];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Grievances!A:J',
        valueInputOption: 'RAW',
        resource: { values }
      });

      return true;
    } catch (error) {
      console.error('Sheets sync failed:', error);
      return false;
    }
  }

  async bulkSyncToSheets(grievances, sheetId = null) {
    if (!this.initialized || !grievances.length) return false;

    try {
      const spreadsheetId = sheetId || process.env.GOOGLE_SHEET_ID;
      if (!spreadsheetId) return false;

      const values = grievances.map(grievance => [
        grievance.trackingId,
        grievance.title,
        grievance.category,
        grievance.priority,
        grievance.status,
        grievance.submittedBy?.name || 'Unknown',
        grievance.submittedBy?.department || 'N/A',
        new Date(grievance.createdAt).toISOString(),
        grievance.assignedTo?.name || 'Unassigned',
        grievance.description?.substring(0, 100) + '...' || ''
      ]);

      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Grievances!A:J',
        valueInputOption: 'RAW',
        resource: { values }
      });

      return values.length;
    } catch (error) {
      console.error('Bulk sheets sync failed:', error);
      return false;
    }
  }

  async sendEmailNotification(to, subject, body, isHtml = false) {
    if (!this.initialized) return false;

    try {
      const headers = [
        `To: ${to}`,
        `Subject: ${subject}`,
        'Content-Type: ' + (isHtml ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8'),
        ''
      ];

      const message = headers.join('\n') + body;
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      await this.gmail.users.messages.send({
        userId: 'me',
        resource: { raw: encodedMessage }
      });

      return true;
    } catch (error) {
      console.error('Gmail send failed:', error);
      return false;
    }
  }

  async sendEscalationEmail(adminEmail, grievance) {
    const subject = `🚨 Escalated Grievance: ${grievance.trackingId}`;
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🚨 Grievance Escalation Alert</h1>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #dc3545; margin-top: 0;">Immediate Attention Required</h2>
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>Tracking ID:</strong> ${grievance.trackingId}</p>
            <p><strong>Title:</strong> ${grievance.title}</p>
            <p><strong>Priority:</strong> <span style="color: #dc3545; font-weight: bold;">${grievance.priority.toUpperCase()}</span></p>
            <p><strong>Submitted by:</strong> ${grievance.submittedBy?.name}</p>
            <p><strong>Department:</strong> ${grievance.submittedBy?.department}</p>
            <p><strong>Submitted on:</strong> ${new Date(grievance.createdAt).toLocaleString()}</p>
          </div>
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 0;"><strong>Description:</strong></p>
            <p style="margin: 10px 0 0 0;">${grievance.description}</p>
          </div>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.FRONTEND_URL}/grievance/${grievance._id}" 
               style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Grievance Details
            </a>
          </div>
          <p style="color: #6c757d; font-size: 12px; margin-top: 20px;">
            This is an automated notification from GrievAI System. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;
    
    return await this.sendEmailNotification(adminEmail, subject, body, true);
  }

  async sendStatusUpdateEmail(userEmail, grievance, oldStatus, newStatus) {
    const subject = `📋 Grievance Status Update: ${grievance.trackingId}`;
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">📋 Status Update</h1>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #28a745; margin-top: 0;">Your Grievance Has Been Updated</h2>
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>Tracking ID:</strong> ${grievance.trackingId}</p>
            <p><strong>Title:</strong> ${grievance.title}</p>
            <p><strong>Status Changed:</strong> 
              <span style="color: #6c757d;">${oldStatus.toUpperCase()}</span> → 
              <span style="color: #28a745; font-weight: bold;">${newStatus.toUpperCase()}</span>
            </p>
            <p><strong>Updated on:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.FRONTEND_URL}/track" 
               style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Track Your Grievance
            </a>
          </div>
          <p style="color: #6c757d; font-size: 12px; margin-top: 20px;">
            Thank you for using GrievAI System. We're committed to resolving your concerns.
          </p>
        </div>
      </div>
    `;
    
    return await this.sendEmailNotification(userEmail, subject, body, true);
  }
}

module.exports = new GoogleIntegration();