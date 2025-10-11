import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const FileUpload = ({ onFilesChange, maxFiles = 5, maxSize = 10 * 1024 * 1024, acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx'] }) => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const validateFile = (file) => {
    if (file.size > maxSize) {
      toast.error(`File ${file.name} is too large. Max size: ${maxSize / 1024 / 1024}MB`);
      return false;
    }
    
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileName.endsWith(type);
      }
      return fileType.match(type.replace('*', '.*'));
    });
    
    if (!isValidType) {
      toast.error(`File ${file.name} type not supported`);
      return false;
    }
    
    return true;
  };

  const handleFiles = useCallback((newFiles) => {
    const validFiles = Array.from(newFiles).filter(validateFile);
    
    if (files.length + validFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const filesWithPreview = validFiles.map(file => ({
      file,
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));

    const updatedFiles = [...files, ...filesWithPreview];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles.map(f => f.file));
  }, [files, maxFiles, onFilesChange]);

  const removeFile = (id) => {
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles.map(f => f.file));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type === 'application/pdf') return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    return '📎';
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => handleFiles(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <div className="text-4xl">📁</div>
          <div>
            <p className="text-lg font-medium text-gray-700">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Max {maxFiles} files, {maxSize / 1024 / 1024}MB each
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supported: Images, PDF, DOC, DOCX
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <h4 className="font-medium text-gray-700">Attached Files ({files.length})</h4>
            
            {files.map((fileObj) => (
              <motion.div
                key={fileObj.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border"
              >
                {fileObj.preview ? (
                  <img 
                    src={fileObj.preview} 
                    alt={fileObj.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xl">
                    {getFileIcon(fileObj.type)}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fileObj.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(fileObj.size)}
                  </p>
                </div>
                
                <button
                  onClick={() => removeFile(fileObj.id)}
                  className="p-1 text-red-500 hover:text-red-700 transition-colors"
                >
                  🗑️
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;