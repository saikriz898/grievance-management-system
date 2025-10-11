const { LanguageServiceClient } = require('@google-cloud/language');
const path = require('path');

class NaturalLanguageService {
  constructor() {
    this.client = null;
    this.initialized = false;
    this.initialize();
  }

  async initialize() {
    try {
      const credentialsPath = path.join(__dirname, '../google-credentials.json');
      this.client = new LanguageServiceClient({
        keyFilename: credentialsPath
      });
      this.initialized = true;
      console.log('Google Natural Language API initialized');
    } catch (error) {
      console.error('Natural Language API initialization failed:', error.message);
    }
  }

  async analyzeGrievance(text) {
    if (!this.initialized) return this.getFallbackAnalysis(text);

    try {
      const document = {
        content: text,
        type: 'PLAIN_TEXT'
      };

      // Analyze sentiment
      const [sentimentResult] = await this.client.analyzeSentiment({ document });
      const sentiment = sentimentResult.documentSentiment;

      // Analyze entities
      const [entitiesResult] = await this.client.analyzeEntities({ document });
      const entities = entitiesResult.entities;

      // Classify text
      const [classificationResult] = await this.client.classifyText({ document });
      const categories = classificationResult.categories;

      return {
        sentiment: {
          score: sentiment.score,
          magnitude: sentiment.magnitude,
          label: this.getSentimentLabel(sentiment.score)
        },
        entities: entities.map(entity => ({
          name: entity.name,
          type: entity.type,
          salience: entity.salience
        })),
        categories: categories.map(cat => ({
          name: cat.name,
          confidence: cat.confidence
        })),
        suggestedCategory: this.mapToGrievanceCategory(categories, entities),
        suggestedPriority: this.mapToPriority(sentiment)
      };
    } catch (error) {
      console.error('Natural Language analysis failed:', error);
      return this.getFallbackAnalysis(text);
    }
  }

  getSentimentLabel(score) {
    if (score > 0.25) return 'positive';
    if (score < -0.25) return 'negative';
    return 'neutral';
  }

  mapToGrievanceCategory(categories, entities) {
    // Map Google's categories to grievance categories
    const categoryMap = {
      '/Computers & Electronics': 'technical',
      '/Education': 'academic',
      '/Business & Industrial': 'administrative',
      '/Law & Government': 'administrative',
      '/Health': 'infrastructure',
      '/People & Society': 'harassment'
    };

    for (const category of categories) {
      for (const [key, value] of Object.entries(categoryMap)) {
        if (category.name.includes(key)) {
          return value;
        }
      }
    }

    // Check entities for keywords
    const entityKeywords = entities.map(e => e.name.toLowerCase()).join(' ');
    if (entityKeywords.includes('exam') || entityKeywords.includes('grade') || entityKeywords.includes('course')) {
      return 'academic';
    }
    if (entityKeywords.includes('building') || entityKeywords.includes('facility') || entityKeywords.includes('maintenance')) {
      return 'infrastructure';
    }
    if (entityKeywords.includes('harassment') || entityKeywords.includes('discrimination')) {
      return 'harassment';
    }
    if (entityKeywords.includes('computer') || entityKeywords.includes('system') || entityKeywords.includes('software')) {
      return 'technical';
    }

    return 'other';
  }

  mapToPriority(sentiment) {
    const score = sentiment.score;
    const magnitude = sentiment.magnitude;

    // High magnitude with negative sentiment = urgent
    if (magnitude > 0.8 && score < -0.5) return 'urgent';
    if (magnitude > 0.6 && score < -0.3) return 'high';
    if (magnitude > 0.4) return 'medium';
    return 'low';
  }

  getFallbackAnalysis(text) {
    const lowerText = text.toLowerCase();
    
    // Simple keyword-based categorization
    let category = 'other';
    if (lowerText.includes('exam') || lowerText.includes('grade') || lowerText.includes('course')) {
      category = 'academic';
    } else if (lowerText.includes('building') || lowerText.includes('facility')) {
      category = 'infrastructure';
    } else if (lowerText.includes('harassment') || lowerText.includes('discrimination')) {
      category = 'harassment';
    } else if (lowerText.includes('computer') || lowerText.includes('system')) {
      category = 'technical';
    } else if (lowerText.includes('fee') || lowerText.includes('admission')) {
      category = 'administrative';
    }

    // Simple priority detection
    let priority = 'medium';
    if (lowerText.includes('urgent') || lowerText.includes('emergency')) {
      priority = 'urgent';
    } else if (lowerText.includes('important') || lowerText.includes('serious')) {
      priority = 'high';
    }

    return {
      sentiment: { score: 0, magnitude: 0.5, label: 'neutral' },
      entities: [],
      categories: [],
      suggestedCategory: category,
      suggestedPriority: priority
    };
  }
}

module.exports = new NaturalLanguageService();