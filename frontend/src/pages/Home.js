import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BrandedLoader from '../components/BrandedLoader';

const Home = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <BrandedLoader message="Welcome to GrievAI..." />;
  }
  
  return (
    <div className="h-screen bg-white overflow-hidden relative pt-32">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 h-full flex items-center px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center space-x-2 bg-gray-100 border border-gray-200 rounded-full px-4 py-2">
              <span className="text-green-500 text-sm">•</span>
              <span className="text-gray-700 text-sm font-medium">🤖 AI-Enhanced Processing</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-gray-900">Smart Grievance</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Resolution Hub
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              🏢 Streamline institutional feedback with intelligent routing, 
              real-time tracking, and automated insights for faster resolutions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/role-selection"
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                🚀 Get Started
              </Link>
              
              <Link
                to="/track"
                className="px-8 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg border border-gray-300 hover:border-gray-400 transition-all duration-200"
              >
                🔍 Track Issue
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">98%</div>
                <div className="text-gray-500 text-sm">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 mb-1">2.3hrs</div>
                <div className="text-gray-500 text-sm">Avg Resolution</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600 mb-1">15K+</div>
                <div className="text-gray-500 text-sm">Cases Handled</div>
              </div>
            </div>
          </motion.div>

          {/* Right Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 font-semibold">📊 Live Dashboard</h3>
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-blue-600 text-sm mb-1">📝 Active</div>
                  <div className="text-2xl font-bold text-gray-900">247</div>
                  <div className="text-green-600 text-xs">↗️ +12%</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="text-emerald-600 text-sm mb-1">✅ Resolved</div>
                  <div className="text-2xl font-bold text-gray-900">1,834</div>
                  <div className="text-emerald-600 text-xs">↗️ +8%</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="text-orange-600 text-sm mb-1">⏱️ Time</div>
                  <div className="text-2xl font-bold text-gray-900">2.3h</div>
                  <div className="text-orange-600 text-xs">↘️ -15%</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-gray-700 text-sm mb-3">🔥 Recent Activity</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">GRV-2024-001</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded">Resolved</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">GRV-2024-002</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">In Progress</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">GRV-2024-003</span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">Pending</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-gray-700 text-sm mb-3">📈 Performance</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Resolution Rate</span>
                      <span className="text-emerald-600 font-medium">98.2%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">User Satisfaction</span>
                      <span className="text-blue-600 font-medium">4.8/5</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">AI Accuracy</span>
                      <span className="text-purple-600 font-medium">99.7%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* AI Chat Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button 
          onClick={() => setIsChatOpen(true)}
          className="group relative w-14 h-14 bg-white border-2 border-gray-300 hover:border-gray-400 rounded-full shadow-2xl hover:shadow-lg transition-all duration-300 hover:scale-110"
        >
          <span className="absolute inset-0 flex items-center justify-center text-gray-700 text-xl">
            💬
          </span>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
        </button>
      </div>
      
      {/* AI Chat Popup */}
      {isChatOpen && <AIChatbot onClose={() => setIsChatOpen(false)} />}
    </div>
  );
};

const AIChatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi! I\'m GrievAI Assistant. How can I help you today?', suggestions: ['Submit grievance', 'Track grievance', 'Contact support', 'System features'] }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showFAQs, setShowFAQs] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSeen, setLastSeen] = useState(new Date());

  React.useEffect(() => {
    fetchFAQs();
    checkOnlineStatus();
    
    const handleOnline = () => {
      setIsOnline(true);
      setLastSeen(new Date());
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const statusInterval = setInterval(checkOnlineStatus, 30000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(statusInterval);
    };
  }, []);

  const checkOnlineStatus = async () => {
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        cache: 'no-cache'
      });
      if (response.ok) {
        setIsOnline(true);
        setLastSeen(new Date());
      } else {
        setIsOnline(false);
      }
    } catch (error) {
      setIsOnline(false);
    }
  };

  const fetchFAQs = async () => {
    try {
      const response = await fetch('/api/chatbot/faqs');
      const data = await response.json();
      if (data.success) {
        setFaqs(data.faqs);
      }
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    }
  };

  const handleSend = async (messageText = input) => {
    if (!messageText.trim()) return;
    
    const userMessage = { type: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: messageText })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const botMessage = { 
          type: 'bot', 
          text: data.response,
          suggestions: data.suggestions || []
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setIsOnline(false);
      const errorMessage = { 
        type: 'bot', 
        text: 'I\'m currently offline. Please check your connection or try again later.',
        suggestions: ['Check connection', 'Try again', 'Contact support']
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  return (
    <div 
      className="fixed bottom-24 right-6 w-80 h-96 bg-white border border-gray-300 rounded-2xl shadow-2xl z-50 flex flex-col"
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">🤖</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">GrievAI</h3>
            <p className={`text-xs flex items-center space-x-1 ${
              isOnline ? 'text-green-600' : 'text-red-500'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}></span>
              <span>
                {isOnline 
                  ? 'Online' 
                  : `Offline • Last seen ${formatLastSeen(lastSeen)}`
                }
              </span>
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
        >
          <span className="text-gray-600 text-sm">✕</span>
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {!showFAQs ? (
          <>
            {messages.map((message, index) => (
              <div key={index}>
                <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-2`}>
                  <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {message.text}
                  </div>
                </div>
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {message.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs rounded-full border border-blue-200 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-3 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Frequently Asked Questions</h4>
              <button 
                onClick={() => setShowFAQs(false)}
                className="text-blue-600 text-sm hover:text-blue-800"
              >
                Back to chat
              </button>
            </div>
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <button
                  onClick={() => {
                    setShowFAQs(false);
                    handleSuggestionClick(faq.question);
                  }}
                  className="text-left w-full"
                >
                  <h5 className="font-medium text-gray-900 mb-1">{faq.question}</h5>
                  <p className="text-sm text-gray-600">{faq.answer.substring(0, 100)}...</p>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <button
            onClick={() => setShowFAQs(!showFAQs)}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full transition-colors"
          >
            📋 FAQs
          </button>
          <button
            onClick={() => {
              setMessages([{ type: 'bot', text: 'Chat cleared! How can I help you?', suggestions: ['Submit grievance', 'Track grievance', 'Contact support'] }]);
            }}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full transition-colors"
          >
            🗑️ Clear
          </button>
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything about grievances..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={isLoading || !isOnline}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading || !isOnline}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors text-sm font-medium"
          >
            {isLoading ? '⏳' : '➤'}
          </button>
        </div>
      </div>
    </div>
  );

  function formatLastSeen(date) {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }
};

export default Home;