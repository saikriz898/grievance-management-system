import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Chatbot from '../components/Chatbot';
import toast from 'react-hot-toast';

const Help = () => {
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  const [showChatbot, setShowChatbot] = useState(false);

  const categories = [
    { id: 'getting-started', label: 'Getting Started', icon: '🚀' },
    { id: 'grievances', label: 'Grievances', icon: '📝' },
    { id: 'tracking', label: 'Tracking', icon: '🔍' },
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'technical', label: 'Technical', icon: '🔧' }
  ];

  const faqs = {
    'getting-started': [
      {
        question: 'How do I create an account?',
        answer: 'Click on "Register" from the home page, select your role (Student/Faculty/Staff), and fill in your details including name, phone number, ID number, and department.'
      },
      {
        question: 'What roles are available?',
        answer: 'We have four roles: Student, Faculty, Staff, and Admin. Each role has different permissions and access levels within the system.'
      },
      {
        question: 'How do I log in?',
        answer: 'Use your registered phone number and password to log in. You can access the login page from the home page or role selection page.'
      }
    ],
    'grievances': [
      {
        question: 'How do I submit a grievance?',
        answer: 'After logging in, click "Submit Grievance" from your dashboard. Fill in the title, description, category, and priority level. You can also attach relevant documents.'
      },
      {
        question: 'What categories are available?',
        answer: 'Available categories include Academic Issues, Infrastructure, Harassment, Administrative, Technical Issues, and Others. Choose the most appropriate category for your grievance.'
      },
      {
        question: 'Can I edit my grievance after submission?',
        answer: 'Once submitted, you cannot edit the grievance details. However, you can add comments and additional information through the comment section.'
      }
    ],
    'tracking': [
      {
        question: 'How do I track my grievance?',
        answer: 'Use your unique tracking ID provided after submission. You can track from the "Track Grievance" page or view all your grievances in "My Grievances" section.'
      },
      {
        question: 'What do the different statuses mean?',
        answer: 'Submitted: Your grievance is received and pending review. In Progress: Being actively worked on. Resolved: Issue has been addressed. Closed: Case is completed.'
      },
      {
        question: 'How long does resolution take?',
        answer: 'Resolution time varies by category and priority. High priority issues are typically addressed within 24-48 hours, while others may take 3-7 business days.'
      }
    ],
    'account': [
      {
        question: 'How do I update my profile?',
        answer: 'Go to Settings > Profile to update your name, phone number, and department information. Some fields like role and ID number cannot be changed.'
      },
      {
        question: 'How do I change my password?',
        answer: 'Navigate to Settings > Security and enter your current password along with your new password. Make sure to use a strong password.'
      },
      {
        question: 'I forgot my password. What should I do?',
        answer: 'Contact the system administrator or use the "Forgot Password" feature if available. You may need to verify your identity through your registered phone number.'
      }
    ],
    'technical': [
      {
        question: 'The website is not loading properly',
        answer: 'Try refreshing the page, clearing your browser cache, or using a different browser. Ensure you have a stable internet connection.'
      },
      {
        question: 'I cannot upload files',
        answer: 'Check that your file size is under the limit (usually 10MB) and in supported formats (PDF, DOC, DOCX, JPG, PNG). Try using a different browser if the issue persists.'
      },
      {
        question: 'How do I contact technical support?',
        answer: 'Use the message assistant (chat button) for immediate help, or contact the admin through the system. For urgent technical issues, call the helpdesk number provided by your institution.'
      }
    ]
  };

  const filteredFaqs = faqs[activeCategory]?.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-32 fade-in">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Help & Support</h1>
          <p className="text-xl text-gray-600 mb-8">Find answers to common questions and get the help you need</p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pl-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl">🔍</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
              <nav className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all cursor-glow ${
                      activeCategory === category.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3 text-lg">{category.icon}</span>
                    {category.label}
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* FAQ Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-3 text-3xl">
                  {categories.find(c => c.id === activeCategory)?.icon}
                </span>
                {categories.find(c => c.id === activeCategory)?.label}
              </h2>

              <div className="space-y-6">
                {filteredFaqs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🤔</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-600">Try adjusting your search or browse different categories</p>
                  </div>
                ) : (
                  filteredFaqs.map((faq, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-glow"
                    >
                      <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-start">
                        <span className="mr-2 text-blue-600">Q:</span>
                        {faq.question}
                      </h3>
                      <p className="text-gray-700 leading-relaxed flex items-start">
                        <span className="mr-2 text-green-600 font-bold">A:</span>
                        {faq.answer}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>


      </div>

      {/* Chatbot */}
      <Chatbot 
        isOpen={showChatbot} 
        onClose={() => setShowChatbot(false)} 
      />

      {/* Floating Message Button */}
      {!showChatbot && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1 }}
          onClick={() => setShowChatbot(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 flex items-center justify-center z-40"
        >
          <span className="text-2xl">💬</span>
        </motion.button>
      )}
    </div>
  );
};

export default Help;