import React, { useState } from 'react';
// Simple CSV export without external dependencies
const exportUtils = {
  jsonToCSV: (data) => {
    if (!data.length) return '';
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header] || '';
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');
    return csvContent;
  }
};

const ExportButton = ({ data, filename = 'export', type = 'excel' }) => {
  const [loading, setLoading] = useState(false);

  const exportToCSV = () => {
    setLoading(true);
    try {
      const csv = exportUtils.jsonToCSV(data);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    exportToCSV();
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading || !data.length}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
    >
      <span>{loading ? '⏳' : '📊'}</span>
      <span>{loading ? 'Exporting...' : 'Export CSV'}</span>
    </button>
  );
};

export default ExportButton;