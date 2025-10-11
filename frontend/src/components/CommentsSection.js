import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';

const CommentsSection = ({ grievanceId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchComments();
  }, [grievanceId]);

  const fetchComments = async () => {
    try {
      const response = await api.get(`/grievances/${grievanceId}/comments`);
      if (response.data.success) {
        setComments(response.data.comments);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    
    setLoading(true);
    try {
      const response = await api.post(`/grievances/${grievanceId}/comments`, {
        text: newComment
      });
      
      if (response.data.success) {
        setComments([...comments, response.data.comment]);
        setNewComment('');
        toast.success('Comment added successfully');
      }
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">💬</span>
        Comments ({comments.length})
      </h3>

      {/* Comments List */}
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {comments.map((comment, index) => (
          <motion.div
            key={comment._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {comment.author?.name?.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{comment.author?.name}</p>
                  <p className="text-xs text-gray-500">{comment.author?.role}</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-700">{comment.text}</p>
          </motion.div>
        ))}
        
        {comments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">💬</div>
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>

      {/* Add Comment */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold">
              {user?.name?.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">
                {newComment.length}/500 characters
              </span>
              <button
                onClick={addComment}
                disabled={loading || !newComment.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>💬</span>
                )}
                <span>{loading ? 'Adding...' : 'Add Comment'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsSection;