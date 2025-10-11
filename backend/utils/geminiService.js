const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.initialized = false;
    this.initialize();
  }

  initialize() {
    try {
      if (!process.env.GEMINI_API_KEY || 
          process.env.GEMINI_API_KEY === 'your_gemini_api_key_here' || 
          process.env.GEMINI_API_KEY === 'paste_your_new_gemini_api_key_here' ||
          process.env.GEMINI_API_KEY.trim() === '') {
        console.log('Gemini API key not configured - AI features disabled');
        return;
      }
      
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      this.initialized = true;
      console.log('Gemini AI service initialized successfully');
    } catch (error) {
      console.error('Gemini initialization failed:', error);
      this.initialized = false;
    }
  }

  async categorizeGrievance(title, description) {
    if (!this.initialized) return null;
    
    try {
      const prompt = `Categorize this grievance into one of these categories: academic, administrative, infrastructure, harassment, technical, other.
      
Title: ${title}
Description: ${description}

Return only the category name in lowercase.`;

      const result = await this.model.generateContent(prompt);
      const category = result.response.text().trim().toLowerCase();
      
      const validCategories = ['academic', 'administrative', 'infrastructure', 'harassment', 'technical', 'other'];
      return validCategories.includes(category) ? category : 'other';
    } catch (error) {
      console.error('Categorization failed:', error);
      return null;
    }
  }

  async analyzeSentiment(title, description) {
    if (!this.initialized) return null;
    
    try {
      const prompt = `Analyze the sentiment and urgency of this grievance. Return priority as: low, medium, high, or urgent.
      
Title: ${title}
Description: ${description}

Consider factors like emotional tone, urgency keywords, and severity. Return only the priority level.`;

      const result = await this.model.generateContent(prompt);
      const priority = result.response.text().trim().toLowerCase();
      
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      return validPriorities.includes(priority) ? priority : 'medium';
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      return null;
    }
  }

  async generateResponse(grievance) {
    if (!this.initialized) return null;
    
    try {
      const prompt = `Generate a professional response template for this grievance:
      
Title: ${grievance.title}
Category: ${grievance.category}
Description: ${grievance.description}

Create a helpful, empathetic response that acknowledges the issue and outlines next steps. Keep it under 200 words.`;

      const result = await this.model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error('Response generation failed:', error);
      return null;
    }
  }

  async moderateContent(text) {
    if (!this.initialized) return { safe: true, reason: null };
    
    try {
      const prompt = `Check if this text contains inappropriate content (harassment, threats, profanity, spam). 
      
Text: ${text}

Return "SAFE" if appropriate, or "UNSAFE: reason" if inappropriate.`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text().trim();
      
      if (response.startsWith('UNSAFE:')) {
        return { safe: false, reason: response.replace('UNSAFE:', '').trim() };
      }
      return { safe: true, reason: null };
    } catch (error) {
      console.error('Content moderation failed:', error);
      return { safe: true, reason: null };
    }
  }

  async summarizeGrievance(description) {
    if (!this.initialized) return null;
    
    try {
      const prompt = `Summarize this grievance in 1-2 sentences:
      
${description}

Keep it concise and capture the main issue.`;

      const result = await this.model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error('Summarization failed:', error);
      return null;
    }
  }

  async chatResponse(message, context = {}) {
    if (!this.initialized) {
      return "I'm currently running in basic mode. I can help you with:\n• Submitting grievances\n• Tracking grievance status\n• General system information\n\nFor advanced AI features, please contact your administrator.";
    }
    
    try {
      const systemPrompt = `You are GrievAI Assistant, a helpful AI chatbot for a grievance management system.

SYSTEM CONTEXT:
- This is a grievance management system for educational institutions
- Users can submit, track, and manage grievances
- Categories: academic, administrative, infrastructure, harassment, technical, other
- Roles: student, faculty, staff, admin
- Features: real-time tracking, automated escalation, AI categorization

USER CONTEXT:
- Role: ${context.role || 'User'}
- Name: ${context.name || 'Anonymous'}

USER MESSAGE: ${message}

Provide a helpful, accurate, and concise response. Be friendly and professional.`;

      const result = await this.model.generateContent(systemPrompt);
      return result.response.text().trim();
    } catch (error) {
      console.error('Chat response failed:', error);
      return "I'm having trouble processing your request. Please try the basic commands or contact support.";
    }
  }
}

module.exports = new GeminiService();