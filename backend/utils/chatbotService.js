const geminiService = require('./geminiService');

class ChatbotService {
  constructor() {
    this.systemContext = `You are GrievAI Assistant, an AI chatbot for a grievance management system. You help users with:

SYSTEM FEATURES:
- Submit grievances (academic, administrative, infrastructure, harassment, technical)
- Track grievances with tracking ID
- View grievance status and updates
- Admin dashboard for management
- Real-time notifications and escalations
- Google Sheets integration for reporting
- Automated categorization and priority detection

USER ROLES:
- Students: Submit and track grievances
- Faculty: Submit grievances and review assigned ones
- Staff: Handle administrative grievances
- Admin: Full system access and management

COMMON QUESTIONS:
- How to submit a grievance
- How to track grievance status
- What categories are available
- How escalation works
- System features and capabilities

Be helpful, concise, and provide specific guidance. If asked about technical details, explain them simply.`;
  }

  async processMessage(message, userContext = {}) {
    try {
      // Try Gemini AI first
      if (geminiService.initialized) {
        const response = await geminiService.chatResponse(message, userContext);
        if (response && !response.includes('trouble processing')) {
          return response;
        }
      }
      
      // Fallback to rule-based responses
      return this.getFallbackResponse(message, userContext);
    } catch (error) {
      console.error('Chatbot error:', error);
      return this.getFallbackResponse(message, userContext);
    }
  }

  getFallbackResponse(message, userContext) {
    const msg = message.toLowerCase();
    const role = userContext.role || 'user';
    const name = userContext.name || 'there';

    // Greeting responses
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      return `Hello ${name}! 👋 I'm here to help you with the grievance system. What would you like to know?`;
    }

    // Submit grievance
    if (msg.includes('submit') || msg.includes('create') || msg.includes('file')) {
      return `To submit a grievance:

1. Go to "Submit Grievance" page
2. Choose category (academic, administrative, infrastructure, etc.)
3. Fill in title and description
4. Set priority level
5. Attach files if needed
6. Click Submit

You'll get a tracking ID to monitor progress! 📋`;
    }

    // Track grievance
    if (msg.includes('track') || msg.includes('status') || msg.includes('check')) {
      return `To track your grievance:

1. Go to "Track Grievance" page
2. Enter your tracking ID (format: GRV-YYYY-XXXXXX)
3. View current status and updates

Or check "My Grievances" to see all your submissions! 🔍`;
    }

    // Categories
    if (msg.includes('categor') || msg.includes('type')) {
      return `Available grievance categories:

📚 Academic - Course, exam, grade issues
🏢 Administrative - Admission, fees, documentation
🏗️ Infrastructure - Buildings, facilities, maintenance
⚠️ Harassment - Any form of harassment
💻 Technical - IT, system, software issues
📝 Other - Anything else

Choose the most relevant category for faster resolution!`;
    }

    // Escalation
    if (msg.includes('escalat') || msg.includes('urgent') || msg.includes('priority')) {
      return `Escalation process:

⏰ Automatic escalation based on priority:
• Urgent: 4 hours
• High: 24 hours  
• Medium: 72 hours
• Low: 1 week

🚨 Manual escalation available for admins
📧 Email notifications sent to relevant authorities

Set appropriate priority when submitting!`;
    }

    // Admin features
    if (msg.includes('admin') && role === 'admin') {
      return `Admin features available:

📊 Enhanced Dashboard (/admin/enhanced)
🤖 AI-powered categorization and responses
📈 Real-time analytics and reporting
📋 Google Sheets integration
📧 Automated email notifications
🔍 Audit logs and transparency controls

Access the Enhanced Portal for advanced features!`;
    }

    // Help/Contact
    if (msg.includes('help') || msg.includes('contact') || msg.includes('support')) {
      return `Need more help?

📞 Contact your system administrator
📧 Check with your institution's IT support
📖 Review the system documentation
🤖 Ask me more specific questions

I'm here 24/7 to assist you! What specific issue can I help with?`;
    }

    // Default response
    return `I can help you with:

• How to submit a grievance
• How to track grievance status
• Available categories and priorities
• Escalation process
• System features and navigation

What would you like to know more about? 🤔`;
  }

  async getQuickReplies() {
    return [
      "How do I submit a grievance?",
      "How can I track my grievance?",
      "What categories are available?",
      "How does escalation work?",
      "Who can I contact for help?"
    ];
  }
}

module.exports = new ChatbotService();