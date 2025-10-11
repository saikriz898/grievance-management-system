import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';
import BrandedLoader from '../components/BrandedLoader';
import FileUpload from '../components/FileUpload';


const SubmitGrievance = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'academic',
    priority: 'medium'
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      
      files.forEach(file => {
        submitData.append('attachments', file);
      });

      const response = await api.post('/grievances', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        toast.success('Grievance submitted successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit grievance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-32 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-10 py-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">📝</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Submit New Grievance
                </h1>
                <p className="text-blue-100 text-lg">
                  Your voice matters. Let us help resolve your concerns.
                </p>
              </div>
            </div>
          </div>

          <div className="px-10 py-8">
            <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="flex items-center text-base font-semibold text-gray-800 mb-3">
                <span className="mr-2">📋</span>
                Grievance Title
              </label>
              <input
                name="title"
                type="text"
                required
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white"
                placeholder="Provide a clear, concise title for your grievance"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="flex items-center text-base font-semibold text-gray-800 mb-3">
                  <span className="mr-2">📂</span>
                  Category
                </label>
                <select
                  name="category"
                  className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white cursor-pointer"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="academic">🎓 Academic Issues</option>
                  <option value="administrative">🏢 Administrative Concerns</option>
                  <option value="infrastructure">🏗️ Infrastructure Problems</option>
                  <option value="harassment">⚠️ Harassment/Discrimination</option>
                  <option value="technical">💻 Technical Issues</option>
                  <option value="other">📋 Other Concerns</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center text-base font-semibold text-gray-800 mb-3">
                  <span className="mr-2">⚡</span>
                  Priority Level
                </label>
                <select
                  name="priority"
                  className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white cursor-pointer"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="low">🟢 Low Priority (7+ days)</option>
                  <option value="medium">🟡 Medium Priority (3-7 days)</option>
                  <option value="high">🟠 High Priority (1-3 days)</option>
                  <option value="urgent">🔴 Urgent (24 hours)</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center text-base font-semibold text-gray-800 mb-3">
                <span className="mr-2">📄</span>
                Detailed Description
              </label>
              <textarea
                name="description"
                required
                rows={8}
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white resize-none"
                placeholder="Please provide a comprehensive description of your grievance. Include relevant details such as dates, locations, people involved, and any supporting information that will help us understand and address your concern effectively."
                value={formData.description}
                onChange={handleChange}
              />
              <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                <span>💡 Tip: Be specific and include all relevant details</span>
                <span>{formData.description.length}/2000 characters</span>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-3">
              <label className="flex items-center text-base font-semibold text-gray-800 mb-3">
                <span className="mr-2">📎</span>
                Attachments (Optional)
              </label>
              <FileUpload onFilesChange={setFiles} maxFiles={5} />
            </div>

            {/* Guidelines Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4">
                <span className="mr-2">📋</span>
                Submission Guidelines
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="flex items-start space-x-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Provide accurate and truthful information</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Include specific dates and locations</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Mention any witnesses or evidence</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Use professional and respectful language</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-6 pt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 border-2 border-gray-300 rounded-2xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-semibold text-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting Grievance...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <span className="mr-2">🚀</span>
                    Submit Grievance
                  </span>
                )}
              </button>
            </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SubmitGrievance;