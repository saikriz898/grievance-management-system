const express = require('express');
const router = express.Router();
const googleChatService = require('../utils/googleChatService');
const Grievance = require('../models/Grievance');
const User = require('../models/User');
const freeNaturalLanguage = require('../utils/freeNaturalLanguage');

// Google Chat webhook endpoint
router.post('/webhook', async (req, res) => {
  try {
    console.log('Google Chat webhook received:', JSON.stringify(req.body, null, 2));
    
    const { type, message, space, user } = req.body;

    if (type === 'MESSAGE') {
      const response = await handleChatMessage(message, space, user);
      res.json(response);
    } else if (type === 'ADDED_TO_SPACE') {
      const response = await handleAddedToSpace(space);
      res.json(response);
    } else {
      res.json({ text: 'Event processed successfully' });
    }
  } catch (error) {
    console.error('Google Chat webhook error:', error);
    res.status(500).json({ text: 'Sorry, I encountered an error processing your request.' });
  }
});

async function handleChatMessage(message, space, user) {
  const text = message.text.toLowerCase();
  const userName = user.displayName;
  const userEmail = user.name.split('/')[1]; // Extract email from user.name

  // Handle grievance submission
  if (text.includes('submit') || text.includes('create grievance') || text.includes('new grievance')) {
    return {
      cards: [{
        header: {
          title: '📝 Submit New Grievance',
          subtitle: `Hello ${userName}! Let's help you submit a grievance.`
        },
        sections: [{
          widgets: [{
            textParagraph: {
              text: 'To submit a grievance, please provide the following information:\n\n**Format:**\n```\nsubmit: [Title]\nDescription: [Your detailed description]\nCategory: [academic/technical/infrastructure/administrative/harassment/other]\n```\n\n**Example:**\n```\nsubmit: WiFi not working in library\nDescription: The WiFi connection in the main library has been down for 3 days\nCategory: technical\n```'
            }
          }, {
            buttons: [{
              textButton: {
                text: 'Web Portal',
                onClick: {
                  openLink: { url: `${process.env.FRONTEND_URL}/submit-grievance` }
                }
              }
            }]
          }]
        }]
      }]
    };
  }

  // Handle actual grievance submission
  if (text.startsWith('submit:')) {
    return await processGrievanceSubmission(text, userEmail, userName, space);
  }

  // Handle tracking
  if (text.includes('track') || text.includes('status')) {
    const trackingIdMatch = text.match(/GRV-\d{4}-\d{6}/);
    if (trackingIdMatch) {
      const trackingId = trackingIdMatch[0];
      return await getGrievanceStatus(trackingId);
    } else {
      return {
        text: `To track your grievance, please provide your tracking ID (format: GRV-YYYY-XXXXXX)\n\nExample: "track GRV-2024-123456"\n\nOr visit: ${process.env.FRONTEND_URL}/track`
      };
    }
  }

  // Handle my grievances
  if (text.includes('my grievances') || text.includes('my complaints')) {
    return await getUserGrievances(userEmail);
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
              text: `**Available Commands:**\n\n• **"submit grievance"** - Get submission format\n• **"submit: [title]"** - Submit new grievance\n• **"track [GRV-YYYY-XXXXXX]"** - Track grievance status\n• **"my grievances"** - View your grievances\n• **"help"** - Show this help message\n\n**Quick Submission Format:**\n\`\`\`\nsubmit: [Title]\nDescription: [Details]\nCategory: [academic/technical/infrastructure/administrative/harassment/other]\n\`\`\``
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
    text: `Hello ${userName}! 👋 I'm GrievAI Assistant.\n\nI can help you:\n• Submit grievances directly in chat\n• Track grievance status\n• View your submitted grievances\n\nType **"help"** for detailed commands or **"submit grievance"** to get started.\n\nWeb Portal: ${process.env.FRONTEND_URL}`
  };
}

async function processGrievanceSubmission(text, userEmail, userName, space) {
  try {
    // Parse the grievance submission
    const lines = text.split('\n');
    const titleMatch = lines[0].match(/submit:\s*(.+)/i);
    const descriptionMatch = text.match(/description:\s*(.+?)(?=\ncategory:|$)/is);
    const categoryMatch = text.match(/category:\s*(\w+)/i);

    if (!titleMatch || !descriptionMatch) {
      return {
        text: 'Please provide both title and description.\n\n**Format:**\n```\nsubmit: [Title]\nDescription: [Your detailed description]\nCategory: [academic/technical/infrastructure/administrative/harassment/other]\n```'
      };
    }

    const title = titleMatch[1].trim();
    const description = descriptionMatch[1].trim();
    const category = categoryMatch ? categoryMatch[1].toLowerCase() : 'other';

    // Find or create user
    let user = await User.findOne({ email: userEmail });
    if (!user) {
      // Create a basic user profile for Google Chat users
      user = new User({
        name: userName,
        email: userEmail,
        idNumber: `GCHAT_${Date.now()}`,
        role: 'student', // Default role
        department: 'Unknown',
        phone: 'Not provided',
        password: 'google_chat_user' // Placeholder
      });
      await user.save();
    }

    // Analyze the grievance using Gemini AI (with fallback)
    const geminiService = require('../utils/geminiService');
    let analysis;
    
    if (geminiService.initialized) {
      // Use Gemini for analysis
      const aiCategory = await geminiService.categorizeGrievance(title, description);
      const aiPriority = await geminiService.analyzeSentiment(title, description);
      analysis = {
        suggestedCategory: aiCategory || category,
        suggestedPriority: aiPriority || 'medium',
        sentiment: { score: 0, magnitude: 0.5, label: 'neutral' },
        aiProcessed: true
      };
    } else {
      // Fallback to free NL service
      analysis = freeNaturalLanguage.analyzeGrievance(`${title} ${description}`);
    }

    // Generate tracking ID
    const trackingId = `GRV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    // Create grievance
    const grievance = new Grievance({
      title,
      description,
      category: analysis.suggestedCategory || category,
      priority: analysis.suggestedPriority || 'medium',
      submittedBy: user._id,
      trackingId,
      status: 'submitted',
      chatSpace: space.name, // Store chat space for notifications
      nlAnalysis: analysis
    });

    await grievance.save();

    return {
      cards: [{
        header: {
          title: '✅ Grievance Submitted Successfully',
          subtitle: `Tracking ID: ${trackingId}`
        },
        sections: [{
          widgets: [{
            keyValue: {
              topLabel: 'Title',
              content: title
            }
          }, {
            keyValue: {
              topLabel: 'Category',
              content: (analysis.suggestedCategory || category).toUpperCase()
            }
          }, {
            keyValue: {
              topLabel: 'Priority',
              content: (analysis.suggestedPriority || 'medium').toUpperCase()
            }
          }, {
            keyValue: {
              topLabel: 'Status',
              content: 'SUBMITTED'
            }
          }, {
            textParagraph: {
              text: `Your grievance has been submitted and assigned tracking ID: **${trackingId}**\n\nYou will receive updates in this chat when the status changes.`
            }
          }, {
            buttons: [{
              textButton: {
                text: 'Track Online',
                onClick: {
                  openLink: { url: `${process.env.FRONTEND_URL}/track?id=${trackingId}` }
                }
              }
            }]
          }]
        }]
      }]
    };

  } catch (error) {
    console.error('Error processing grievance submission:', error);
    return {
      text: 'Sorry, there was an error submitting your grievance. Please try again or use the web portal.'
    };
  }
}

async function getGrievanceStatus(trackingId) {
  try {
    const grievance = await Grievance.findOne({ trackingId }).populate('submittedBy', 'name');
    
    if (!grievance) {
      return {
        text: `No grievance found with tracking ID: ${trackingId}\n\nPlease check the ID and try again.`
      };
    }

    const statusEmoji = {
      'submitted': '📝',
      'under_review': '👀',
      'in_progress': '⚙️',
      'resolved': '✅',
      'closed': '🔒',
      'rejected': '❌'
    };

    return {
      cards: [{
        header: {
          title: `${statusEmoji[grievance.status] || '📋'} Grievance Status`,
          subtitle: `ID: ${trackingId}`
        },
        sections: [{
          widgets: [{
            keyValue: {
              topLabel: 'Title',
              content: grievance.title
            }
          }, {
            keyValue: {
              topLabel: 'Status',
              content: grievance.status.replace('_', ' ').toUpperCase()
            }
          }, {
            keyValue: {
              topLabel: 'Priority',
              content: grievance.priority.toUpperCase()
            }
          }, {
            keyValue: {
              topLabel: 'Category',
              content: grievance.category.toUpperCase()
            }
          }, {
            keyValue: {
              topLabel: 'Submitted',
              content: grievance.createdAt.toLocaleDateString()
            }
          }, {
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

  } catch (error) {
    console.error('Error getting grievance status:', error);
    return {
      text: 'Sorry, there was an error retrieving the grievance status. Please try again.'
    };
  }
}

async function getUserGrievances(userEmail) {
  try {
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return {
        text: 'No user account found. Please submit a grievance first to create your account.'
      };
    }

    const grievances = await Grievance.find({ submittedBy: user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    if (grievances.length === 0) {
      return {
        text: 'You have not submitted any grievances yet.\n\nType "submit grievance" to get started.'
      };
    }

    const widgets = grievances.map(grievance => ({
      keyValue: {
        topLabel: grievance.trackingId,
        content: `${grievance.title} - ${grievance.status.toUpperCase()}`,
        contentMultiline: true
      }
    }));

    widgets.push({
      buttons: [{
        textButton: {
          text: 'View All Online',
          onClick: {
            openLink: { url: `${process.env.FRONTEND_URL}/dashboard` }
          }
        }
      }]
    });

    return {
      cards: [{
        header: {
          title: '📋 Your Recent Grievances',
          subtitle: `Showing ${grievances.length} most recent`
        },
        sections: [{
          widgets: widgets
        }]
      }]
    };

  } catch (error) {
    console.error('Error getting user grievances:', error);
    return {
      text: 'Sorry, there was an error retrieving your grievances. Please try again.'
    };
  }
}

async function handleAddedToSpace(space) {
  return {
    cards: [{
      header: {
        title: '🎉 Welcome to GrievAI!',
        subtitle: 'Your AI-powered grievance management assistant'
      },
      sections: [{
        widgets: [{
          textParagraph: {
            text: 'I can help you submit and track grievances directly from Google Chat!\n\n**Quick Start:**\n• Type **"help"** for all commands\n• Type **"submit grievance"** to get started\n• Type **"my grievances"** to view your submissions'
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

module.exports = router;