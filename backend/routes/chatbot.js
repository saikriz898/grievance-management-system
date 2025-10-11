const express = require('express');
const router = express.Router();

// Comprehensive Knowledge Base
const knowledgeBase = {
  // Grievance System
  'submit': 'To submit a grievance: 1) Register/Login 2) Click "Submit Grievance" 3) Fill form with details 4) Get tracking ID',
  'track': 'Track grievances using tracking ID (GRV-YYYY-XXXXXX) on Track page or ask me with your ID',
  'status': 'Statuses: Submitted (reviewing), In Progress (processing), Resolved (completed), Closed (finalized)',
  'categories': 'Categories: Academic, Administrative, Facility, Harassment, Technical, Other issues',
  'priority': 'Priority levels: Low (7 days), Medium (3 days), High (24 hours), Critical (immediate)',
  'documents': 'Required documents: ID proof, incident details, supporting evidence (photos/videos if applicable)',
  
  // Account & Access
  'login': 'Login with phone number and password. Forgot password? Use reset option on login page',
  'register': 'Register with: Name, Phone, Password, Role (Student/Faculty/Staff), ID Number, Department',
  'password': 'Reset password: Go to login page → Forgot Password → Enter phone → Check SMS for reset link',
  'roles': 'User roles: Student (submit/track), Faculty (submit/track/review), Staff (submit/track), Admin (full access)',
  
  // System Features
  'ai': 'GrievAI features: Auto-categorization, Priority detection, Smart routing, Sentiment analysis, Predictive resolution',
  'notifications': 'Get updates via: Email, SMS, Dashboard notifications, Real-time status changes',
  'dashboard': 'Dashboard shows: Your grievances, Status updates, Analytics, Quick actions, Recent activity',
  'analytics': 'View: Resolution trends, Response times, Category statistics, Satisfaction ratings',
  
  // Support & Contact
  'support': 'Contact: Email: support@company.com | Phone: Contact admin for phone support | Live chat available 24/7',
  'hours': 'System available 24/7. Support team: Mon-Fri 9AM-6PM, Emergency support always available',
  'emergency': 'For emergencies: Contact admin immediately or mark grievance as "Critical" priority',
  
  // Technical
  'browser': 'Supported browsers: Chrome, Firefox, Safari, Edge (latest versions). Mobile app coming soon!',
  'mobile': 'Mobile responsive design works on all devices. Native mobile app in development',
  'security': 'Security: 256-bit encryption, secure login, data privacy compliance, regular security audits',
  'backup': 'Data backup: Automatic daily backups, 99.9% uptime guarantee, disaster recovery protocols',
  
  // General Conversation
  'hello': 'Hello! I\'m GrievAI Assistant. I can help with grievances, account issues, system features, and general questions.',
  'help': 'I can assist with: Submitting grievances, Tracking status, Account problems, System features, Technical support',
  'thanks': 'You\'re welcome! Is there anything else I can help you with today?',
  'bye': 'Goodbye! Feel free to return anytime if you need assistance. Have a great day!',
  'weather': 'I focus on grievance management, but I hope you\'re having great weather! How can I help with your grievances?',
  'time': 'I don\'t have access to current time, but our system operates 24/7. What can I help you with?',
  'joke': 'Why did the grievance go to therapy? It had too many issues to resolve! 😄 Now, how can I help you?'
};

// Enhanced keyword mapping with synonyms
const keywordMap = {
  // Greetings
  'hello': ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'],
  'help': ['help', 'assist', 'support', 'guide', 'what can you do'],
  'thanks': ['thank', 'thanks', 'appreciate', 'grateful'],
  'bye': ['bye', 'goodbye', 'see you', 'farewell', 'exit', 'quit'],
  
  // Grievance Operations
  'submit': ['submit', 'file', 'create', 'new grievance', 'complaint', 'report issue'],
  'track': ['track', 'check status', 'follow up', 'monitor', 'where is my'],
  'status': ['status', 'state', 'progress', 'update', 'current situation'],
  'categories': ['category', 'type', 'kind', 'classification', 'what types'],
  'priority': ['priority', 'urgent', 'important', 'critical', 'emergency'],
  'documents': ['document', 'file', 'attachment', 'evidence', 'proof', 'what do i need'],
  
  // Account Management
  'login': ['login', 'sign in', 'access', 'enter', 'authenticate'],
  'register': ['register', 'sign up', 'create account', 'new user', 'join'],
  'password': ['password', 'forgot password', 'reset', 'change password', 'cant login'],
  'roles': ['role', 'permission', 'access level', 'user type', 'who can'],
  
  // System Features
  'ai': ['ai', 'artificial intelligence', 'machine learning', 'smart features', 'automation'],
  'notifications': ['notification', 'alert', 'update', 'message', 'email', 'sms'],
  'dashboard': ['dashboard', 'home page', 'main screen', 'overview', 'summary'],
  'analytics': ['analytics', 'statistics', 'reports', 'data', 'metrics', 'trends'],
  
  // Support
  'support': ['support', 'contact', 'help desk', 'customer service', 'assistance'],
  'hours': ['hours', 'time', 'when', 'availability', 'schedule', 'open'],
  'emergency': ['emergency', 'urgent', 'critical', 'immediate', 'asap'],
  
  // Technical
  'browser': ['browser', 'chrome', 'firefox', 'safari', 'edge', 'compatibility'],
  'mobile': ['mobile', 'phone', 'app', 'smartphone', 'tablet', 'responsive'],
  'security': ['security', 'safe', 'privacy', 'encryption', 'protection', 'secure'],
  'backup': ['backup', 'data', 'recovery', 'uptime', 'reliability'],
  
  // Casual
  'weather': ['weather', 'rain', 'sunny', 'temperature', 'climate'],
  'time': ['time', 'clock', 'date', 'when', 'what time'],
  'joke': ['joke', 'funny', 'humor', 'laugh', 'entertainment']
};

// Enhanced chat endpoint with natural language processing
router.post('/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const userMessage = message.toLowerCase().trim();
    let response = '';
    let suggestions = [];
    let bestMatch = null;
    let highestScore = 0;

    // Check for tracking ID pattern
    const trackingPattern = /grv[-_]?\d{4}[-_]?\d{6}/i;
    if (trackingPattern.test(userMessage)) {
      response = `I found tracking ID in your message! Use the Track Grievance page for real-time updates, or ask me about status meanings.`;
      suggestions = ['What do statuses mean?', 'How long for resolution?', 'Contact support'];
    }
    // Natural language processing
    else {
      
      // Score-based matching for better accuracy
      for (const [key, synonyms] of Object.entries(keywordMap)) {
        let score = 0;
        
        // Check direct keyword match
        if (userMessage.includes(key)) {
          score += 10;
        }
        
        // Check synonym matches
        for (const synonym of synonyms) {
          if (userMessage.includes(synonym)) {
            score += 8;
          }
        }
        
        // Partial word matching
        const words = userMessage.split(' ');
        for (const word of words) {
          for (const synonym of synonyms) {
            if (word.includes(synonym) || synonym.includes(word)) {
              score += 3;
            }
          }
        }
        
        if (score > highestScore) {
          highestScore = score;
          bestMatch = key;
        }
      }
      
      // Get response based on best match
      if (bestMatch && highestScore >= 3) {
        response = knowledgeBase[bestMatch];
        suggestions = getContextualSuggestions(bestMatch, userMessage);
      } else {
        // Intelligent fallback responses
        const fallbackResponses = [
          "I'd love to help! I can assist with grievances, accounts, system features, or just chat. What's on your mind?",
          "I'm here for you! Ask me about submitting grievances, tracking issues, account help, or anything else.",
          "Not sure I caught that, but I'm ready to help! Try asking about grievances, your account, or system features.",
          "I can help with many things! Grievance management, account issues, system info, or general questions - what do you need?"
        ];
        response = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        suggestions = ['Submit grievance', 'Track status', 'Account help', 'System features', 'Contact support'];
      }
    }

    res.json({
      success: true,
      response,
      suggestions,
      timestamp: new Date().toISOString(),
      confidence: bestMatch ? highestScore : 0
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      response: 'Oops! I\'m having technical difficulties. Please try again or contact our support team for immediate assistance.',
      suggestions: ['Contact support', 'Try again', 'System status']
    });
  }
});

// Get comprehensive FAQ list
router.get('/faqs', (req, res) => {
  const faqCategories = {
    'Grievance Management': {
      'How to submit a grievance?': knowledgeBase.submit,
      'How to track my grievance?': knowledgeBase.track,
      'What are grievance statuses?': knowledgeBase.status,
      'What categories are available?': knowledgeBase.categories,
      'How does priority work?': knowledgeBase.priority
    },
    'Account & Access': {
      'How to login?': knowledgeBase.login,
      'How to register?': knowledgeBase.register,
      'Forgot password help?': knowledgeBase.password,
      'What are user roles?': knowledgeBase.roles
    },
    'System Features': {
      'What AI features are available?': knowledgeBase.ai,
      'How do notifications work?': knowledgeBase.notifications,
      'What\'s in the dashboard?': knowledgeBase.dashboard,
      'Can I see analytics?': knowledgeBase.analytics
    },
    'Support & Contact': {
      'How to contact support?': knowledgeBase.support,
      'What are support hours?': knowledgeBase.hours,
      'Emergency contact info?': knowledgeBase.emergency
    }
  };
  
  res.json({
    success: true,
    categories: faqCategories,
    totalFaqs: Object.values(faqCategories).reduce((sum, cat) => sum + Object.keys(cat).length, 0)
  });
});

function getContextualSuggestions(matchedKey, userMessage) {
  const suggestionMap = {
    'hello': ['How to submit grievance?', 'Track my grievance', 'Account help', 'System features'],
    'submit': ['What documents needed?', 'Grievance categories', 'Priority levels', 'Track status'],
    'track': ['Status meanings', 'Get notifications', 'Contact support', 'Update frequency'],
    'status': ['Priority levels', 'Response times', 'Get updates', 'Contact support'],
    'login': ['Reset password', 'Register account', 'User roles', 'Contact support'],
    'password': ['Login help', 'Account recovery', 'Contact support', 'Security info'],
    'support': ['Emergency contact', 'Support hours', 'System status', 'Live chat'],
    'ai': ['System features', 'Analytics', 'Notifications', 'Dashboard'],
    'mobile': ['Browser support', 'System features', 'Contact support', 'Updates'],
    'security': ['Data backup', 'Privacy policy', 'Account safety', 'Contact support'],
    'thanks': ['Submit grievance', 'Track status', 'Account help', 'Anything else?'],
    'bye': ['Need more help?', 'Contact support', 'System features', 'Come back anytime!']
  };
  
  return suggestionMap[matchedKey] || ['Submit grievance', 'Track status', 'Account help', 'Contact support'];
}

// Additional utility endpoint for chatbot capabilities
router.get('/capabilities', (req, res) => {
  res.json({
    success: true,
    capabilities: {
      'Grievance Management': ['Submit', 'Track', 'Status Updates', 'Categories', 'Priority Handling'],
      'Account Support': ['Login Help', 'Registration', 'Password Reset', 'Role Management'],
      'System Information': ['AI Features', 'Analytics', 'Notifications', 'Dashboard'],
      'Technical Support': ['Browser Support', 'Mobile Access', 'Security', 'Backup'],
      'General Chat': ['Greetings', 'Help', 'Casual Conversation', 'Farewells']
    },
    languages: ['English'],
    availability: '24/7',
    responseTime: 'Instant'
  });
});

module.exports = router;