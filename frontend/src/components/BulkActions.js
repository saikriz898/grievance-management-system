import React, { useState } from 'react';

const BulkActions = ({ selectedItems, onBulkAction, actions }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');

  const handleAction = (action) => {
    if (action === 'delete') {
      setSelectedAction(action);
      setShowConfirm(true);
    } else {
      onBulkAction(action, selectedItems);
    }
  };

  const confirmAction = () => {
    onBulkAction(selectedAction, selectedItems);
    setShowConfirm(false);
    setSelectedAction('');
  };

  if (selectedItems.length === 0) return null;

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-blue-800 font-medium">
            {selectedItems.length} item(s) selected
          </span>
          <div className="flex space-x-2">
            {actions.map((action) => (
              <button
                key={action.key}
                onClick={() => handleAction(action.key)}
                className={`px-4 py-2 rounded-lg font-medium ${action.className}`}
              >
                <span className="mr-2">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Action</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedItems.length} item(s)? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkActions;