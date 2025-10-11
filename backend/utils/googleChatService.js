const { google } = require('googleapis');
const path = require('path');

class GoogleChatService {
  constructor() {
    this.chat = null;
    this.initialized = false;
    this.initialize();
  }

  async initialize() {
    try {
      const credentialsPath = path.join(__dirname, '../grievance-system-474805-b49970b3b2ea.json');
      const auth = new google.auth.GoogleAuth({
        keyFile: credentialsPath,
        scopes: ['https://www.googleapis.com/auth/chat.bot']
      });

      this.chat = google.chat({ version: 'v1', auth });
      this.initialized = true;
      console.log('Google Chat API initialized');
    } catch (error) {
      console.error('Google Chat API initialization failed:', error.message);
    }
  }

  async sendMessage(space, message) {
    if (!this.initialized) return false;

    try {
      const requestBody = typeof message === 'string' ? { text: message } : message;
      const response = await this.chat.spaces.messages.create({
        parent: space,
        requestBody
      });
      return response.data;
    } catch (error) {
      console.error('Failed to send Chat message:', error);
      return false;
    }
  }

  async sendCardMessage(space, title, subtitle, buttons = []) {
    if (!this.initialized) return false;

    try {
      const card = {
        cards: [{
          header: { title, subtitle },
          sections: [{
            widgets: buttons.map(button => ({
              buttons: [{
                textButton: {
                  text: button.text,
                  onClick: {
                    openLink: { url: button.url }
                  }
                }
              }]
            }))
          }]
        }]
      };

      const response = await this.chat.spaces.messages.create({
        parent: space,
        requestBody: { cards: [card] }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to send Chat card:', error);
      return false;
    }
  }

  async handleWebhook(req, res) {
    try {
      const { type, message, space, user } = req.body;

      if (type === 'MESSAGE') {
        return await this.handleMessage(message, space, user);
      } else if (type === 'ADDED_TO_SPACE') {
        return await this.handleAddedToSpace(space);
      }

      return { text: 'Event processed' };
    } catch (error) {
      console.error('Webhook handling error:', error);
      return { text: 'Error processing request' };
    }
  }

  async handleMessage(message, space, user) {
    const text = message.text.toLowerCase();
    const userName = user.displayName;

    // Handle grievance submission
    if (text.includes('submit') || text.includes('create grievance')) {
      return {
        cards: [{
          header: {
            title: '📝 Submit New Grievance',
            subtitle: `Hello ${userName}! Let's help you submit a grievance.`
          },
          sections: [{
            widgets: [{
              buttons: [{
                textButton: {
                  text: 'Submit Grievance',
                  onClick: {
                    openLink: { url: `${process.env.FRONTEND_URL}/submit-grievance` }
                  }
                }
              }]
            }, {
              textParagraph: {
                text: 'Click the button above to submit a new grievance through our web portal.'
              }
            }]
          }]
        }]
      };
    }

    // Handle tracking
    if (text.includes('track') || text.includes('status')) {
      const trackingIdMatch = text.match(/GRV-\d{4}-\d{6}/);
      if (trackingIdMatch) {
        const trackingId = trackingIdMatch[0];
        return {
          cards: [{
            header: {
              title: '🔍 Track Grievance',
              subtitle: `Tracking ID: ${trackingId}`
            },
            sections: [{
              widgets: [{
                buttons: [{
                  textButton: {
                    text: 'View Details',
                    onClick: {
                      openLink: { url: `${process.env.FRONTEND_URL}/track?id=${trackingId}` }
                    }
                  }
                }]
              }]
            }]
          }]
        };
      } else {
        return {
          text: `To track your grievance, please provide your tracking ID (format: GRV-YYYY-XXXXXX) or visit: ${process.env.FRONTEND_URL}/track`
        };
      }
    }

    // Handle help
    if (text.includes('help') || text.includes('commands')) {
      return {
        cards: [{
          header: {
            title: '🤖 GrievAI Chat Commands',
            subtitle: 'Available commands and features'
          },
          sections: [{
            widgets: [{
              textParagraph: {
                text: `**Available Commands:**
• "submit grievance" - Submit a new grievance
• "track [GRV-YYYY-XXXXXX]" - Track grievance status
• "help" - Show this help message

**Quick Links:**`
              }
            }, {
              buttons: [{
                textButton: {
                  text: 'Web Portal',
                  onClick: {
                    openLink: { url: process.env.FRONTEND_URL }
                  }
                }
              }]
            }]
          }]
        }]
      };
    }

    // Default response
    return {
      text: `Hello ${userName}! 👋 I'm GrievAI Assistant. I can help you:
• Submit grievances
• Track grievance status
• Get system information

Type "help" for more commands or visit our web portal: ${process.env.FRONTEND_URL}`
    };
  }

  async handleAddedToSpace(space) {
    return {
      cards: [{
        header: {
          title: '🎉 Welcome to GrievAI!',
          subtitle: 'Your AI-powered grievance management assistant'
        },
        sections: [{
          widgets: [{
            textParagraph: {
              text: 'I can help you submit and track grievances directly from Google Chat!'
            }
          }, {
            buttons: [{
              textButton: {
                text: 'Get Started',
                onClick: {
                  openLink: { url: process.env.FRONTEND_URL }
                }
              }
            }]
          }]
        }]
      }]
    };
  }

  async notifyGrievanceUpdate(chatSpace, grievance, status) {
    if (!this.initialized || !chatSpace) return false;

    const message = {
      cards: [{
        header: {
          title: '📢 Grievance Update',
          subtitle: `Status: ${status.toUpperCase()}`
        },
        sections: [{
          widgets: [{
            keyValue: {
              topLabel: 'Tracking ID',
              content: grievance.trackingId
            }
          }, {
            keyValue: {
              topLabel: 'Title',
              content: grievance.title
            }
          }, {
            keyValue: {
              topLabel: 'New Status',
              content: status.replace('_', ' ').toUpperCase()
            }
          }, {
            buttons: [{
              textButton: {
                text: 'View Details',
                onClick: {
                  openLink: { url: `${process.env.FRONTEND_URL}/track?id=${grievance.trackingId}` }
                }
              }
            }]
          }]
        }]
      }]
    };

    return await this.sendMessage(chatSpace, message);
  }
}

module.exports = new GoogleChatService();