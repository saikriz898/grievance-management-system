import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const HelpModal = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 modal-overlay"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-2xl modal-content help-modal w-full max-w-6xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Help & Support</h2>
                <p className="text-gray-600">Find answers to common questions</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-2xl">✕</span>
              </button>
            </div>

            {/* Search */}
            <div className="px-6 py-2 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl">🔍</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex h-96">
              {/* Categories */}
              <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto help-sidebar">
                <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg font-medium modal-button ${
                        activeCategory === category.id
                          ? 'category-active text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="mr-2">{category.icon}</span>
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* FAQ Content */}
              <div className="flex-1 p-6 overflow-y-auto help-content">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">
                    {categories.find(c => c.id === activeCategory)?.icon}
                  </span>
                  {categories.find(c => c.id === activeCategory)?.label}
                </h3>

                <div className="space-y-4">
                  {filteredFaqs.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">🤔</div>
                      <h4 className="font-bold text-gray-900 mb-1">No results found</h4>
                      <p className="text-gray-600 text-sm">Try adjusting your search or browse different categories</p>
                    </div>
                  ) : (
                    filteredFaqs.map((faq, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 faq-item"
                      >
                        <h4 className="font-bold text-gray-900 mb-2 flex items-start">
                          <span className="mr-2 text-blue-600">Q:</span>
                          {faq.question}
                        </h4>
                        <p className="text-gray-700 text-sm flex items-start">
                          <span className="mr-2 text-green-600 font-bold">A:</span>
                          {faq.answer}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-4 justify-center" style={{ marginBottom: '120px' }}>
                <button 
                  onClick={() => toast.success('Email support: support@grievai.com')}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium modal-button"
                >
                  📧 Email Support
                </button>
                <button 
                  onClick={() => toast.success('Call support: +1-800-GRIEVAI')}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium modal-button"
                >
                  📞 Call Support
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default HelpModal;