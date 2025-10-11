class FreeNaturalLanguageService {
  constructor() {
    this.initialized = true;
    console.log('Free Natural Language service initialized');
  }

  analyzeGrievance(text) {
    try {
      const sentiment = this.analyzeSentiment(text);
      const entities = this.extractEntities(text);
      const categories = this.classifyText(text);
      
      return {
        sentiment: {
          score: sentiment.score,
          magnitude: sentiment.magnitude,
          label: sentiment.label
        },
        entities: entities,
        categories: categories,
        suggestedCategory: this.mapToGrievanceCategory(text),
        suggestedPriority: this.mapToPriority(sentiment, text)
      };
    } catch (error) {
      console.error('Free NL analysis failed:', error);
      return this.getFallbackAnalysis(text);
    }
  }

  analyzeSentiment(text) {
    const lowerText = text.toLowerCase();
    let score = 0;
    let magnitude = 0;

    // Positive words
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'perfect', 'love', 'like', 'happy', 'satisfied', 'pleased'];
    // Negative words
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'angry', 'frustrated', 'disappointed', 'upset', 'annoyed', 'furious', 'disgusted'];
    // Urgent words
    const urgentWords = ['urgent', 'emergency', 'immediate', 'critical', 'serious', 'important', 'asap', 'quickly', 'help'];

    let positiveCount = 0;
    let negativeCount = 0;
    let urgentCount = 0;

    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveCount++;
    });

    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeCount++;
    });

    urgentWords.forEach(word => {
      if (lowerText.includes(word)) urgentCount++;
    });

    // Calculate score (-1 to 1)
    const totalWords = text.split(' ').length;
    score = (positiveCount - negativeCount) / Math.max(totalWords * 0.1, 1);
    score = Math.max(-1, Math.min(1, score));

    // Calculate magnitude (0 to 1)
    magnitude = (positiveCount + negativeCount + urgentCount) / Math.max(totalWords * 0.1, 1);
    magnitude = Math.min(1, magnitude);

    const label = score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral';

    return { score, magnitude, label };
  }

  extractEntities(text) {
    const entities = [];
    
    // Extract email addresses
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailRegex) || [];
    emails.forEach(email => {
      entities.push({ name: email, type: 'EMAIL', salience: 0.8 });
    });

    // Extract phone numbers
    const phoneRegex = /\b\d{10}\b|\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
    const phones = text.match(phoneRegex) || [];
    phones.forEach(phone => {
      entities.push({ name: phone, type: 'PHONE_NUMBER', salience: 0.7 });
    });

    // Extract common academic entities
    const academicTerms = ['exam', 'test', 'grade', 'course', 'subject', 'professor', 'teacher', 'assignment'];
    academicTerms.forEach(term => {
      if (text.toLowerCase().includes(term)) {
        entities.push({ name: term, type: 'ACADEMIC', salience: 0.6 });
      }
    });

    // Extract infrastructure entities
    const infrastructureTerms = ['building', 'room', 'facility', 'toilet', 'water', 'electricity', 'maintenance'];
    infrastructureTerms.forEach(term => {
      if (text.toLowerCase().includes(term)) {
        entities.push({ name: term, type: 'INFRASTRUCTURE', salience: 0.6 });
      }
    });

    return entities;
  }

  classifyText(text) {
    const categories = [];
    const lowerText = text.toLowerCase();

    // Academic classification
    if (lowerText.match(/\b(exam|test|grade|marks|result|course|subject|teacher|professor|assignment|homework|study|class|lecture)\b/)) {
      categories.push({ name: '/Education/Academic', confidence: 0.8 });
    }

    // Infrastructure classification
    if (lowerText.match(/\b(building|room|facility|maintenance|repair|broken|damaged|toilet|water|electricity|infrastructure)\b/)) {
      categories.push({ name: '/Infrastructure/Facilities', confidence: 0.8 });
    }

    // Technical classification
    if (lowerText.match(/\b(computer|laptop|internet|wifi|system|software|website|login|password|technical|technology)\b/)) {
      categories.push({ name: '/Computers & Electronics', confidence: 0.8 });
    }

    // Administrative classification
    if (lowerText.match(/\b(fee|admission|document|certificate|registration|office|staff|administration|administrative)\b/)) {
      categories.push({ name: '/Business & Industrial/Administration', confidence: 0.8 });
    }

    // Harassment classification
    if (lowerText.match(/\b(harassment|discrimination|bullying|inappropriate|misconduct|abuse|unfair|bias)\b/)) {
      categories.push({ name: '/People & Society/Social Issues', confidence: 0.9 });
    }

    return categories;
  }

  mapToGrievanceCategory(text) {
    const lowerText = text.toLowerCase();

    if (lowerText.match(/\b(harassment|discrimination|bullying|inappropriate|misconduct|abuse)\b/)) {
      return 'harassment';
    }
    if (lowerText.match(/\b(exam|test|grade|marks|result|course|subject|teacher|professor|assignment|homework)\b/)) {
      return 'academic';
    }
    if (lowerText.match(/\b(building|room|facility|maintenance|repair|broken|damaged|toilet|water|electricity)\b/)) {
      return 'infrastructure';
    }
    if (lowerText.match(/\b(computer|laptop|internet|wifi|system|software|website|login|password|technical)\b/)) {
      return 'technical';
    }
    if (lowerText.match(/\b(fee|admission|document|certificate|registration|office|staff|administration)\b/)) {
      return 'administrative';
    }

    return 'other';
  }

  mapToPriority(sentiment, text) {
    const lowerText = text.toLowerCase();
    const { score, magnitude } = sentiment;

    // Check for urgent keywords first
    if (lowerText.match(/\b(urgent|emergency|immediate|critical|asap|help|quickly)\b/)) {
      return 'urgent';
    }

    // High magnitude with negative sentiment = high priority
    if (magnitude > 0.7 && score < -0.3) return 'high';
    if (magnitude > 0.5 && score < -0.2) return 'high';
    
    // Check for serious keywords
    if (lowerText.match(/\b(serious|important|major|significant)\b/)) {
      return 'high';
    }

    // Medium priority for moderate sentiment
    if (magnitude > 0.3) return 'medium';

    return 'low';
  }

  getFallbackAnalysis(text) {
    return {
      sentiment: { score: 0, magnitude: 0.5, label: 'neutral' },
      entities: [],
      categories: [],
      suggestedCategory: 'other',
      suggestedPriority: 'medium'
    };
  }
}

module.exports = new FreeNaturalLanguageService();