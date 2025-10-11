import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Loading from '../components/Loading';
import Chatbot from '../components/Chatbot';
import HelpModal from '../components/HelpModal';
import { useDebounce } from '../hooks/useDebounce';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/Pagination';
import BulkActions from '../components/BulkActions';
import ExportButton from '../components/ExportButton';
import DarkModeToggle from '../components/DarkModeToggle';

const AdminUsers = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showChatbot, setShowChatbot] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    name: '',
    role: '',
    department: '',
    idNumber: '',
    phone: '',
    dateFrom: '',
    dateTo: ''
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    let filtered = users;
    
    if (filter !== 'all') {
      filtered = filtered.filter(user => user.role === filter);
    }
    
    if (debouncedSearch) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        user.phone.includes(debouncedSearch) ||
        (user.idNumber && user.idNumber.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        (user.department && user.department.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        user.role.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }
    
    // Advanced filters
    filtered = filtered.filter(user => {
      return (!advancedFilters.name || user.name.toLowerCase().includes(advancedFilters.name.toLowerCase())) &&
        (!advancedFilters.role || user.role === advancedFilters.role) &&
        (!advancedFilters.department || (user.department && user.department.toLowerCase().includes(advancedFilters.department.toLowerCase()))) &&
        (!advancedFilters.idNumber || (user.idNumber && user.idNumber.toLowerCase().includes(advancedFilters.idNumber.toLowerCase()))) &&
        (!advancedFilters.phone || user.phone.includes(advancedFilters.phone)) &&
        (!advancedFilters.dateFrom || new Date(user.createdAt) >= new Date(advancedFilters.dateFrom)) &&
        (!advancedFilters.dateTo || new Date(user.createdAt) <= new Date(advancedFilters.dateTo));
    });
    
    return filtered;
  }, [users, filter, debouncedSearch, advancedFilters]);

  const { currentPage, totalPages, paginatedData, goToPage, hasNext, hasPrev } = usePagination(filteredUsers, 10);

  useEffect(() => {
    setSelectedUsers([]);
    setSelectAll(false);
  }, [filteredUsers]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 404) {
        toast.error('Admin endpoints not available. Using demo data.');
        setUsers([
          { _id: '1', name: 'John Doe', role: 'student', phone: '1234567890', idNumber: 'STU001', department: 'Computer Science', createdAt: new Date() },
          { _id: '2', name: 'Jane Smith', role: 'faculty', phone: '0987654321', idNumber: 'FAC001', department: 'Mathematics', createdAt: new Date() },
          { _id: '3', name: 'Bob Wilson', role: 'staff', phone: '5555555555', idNumber: 'STF001', department: 'Administration', createdAt: new Date() }
        ]);
      } else {
        toast.error('Failed to fetch users');
        setUsers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedData.map(user => user._id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkAction = async (action, userIds) => {
    try {
      if (action === 'delete') {
        await Promise.all(userIds.map(id => api.delete(`/admin/users/${id}`)));
        toast.success(`Deleted ${userIds.length} users`);
        fetchUsers();
        setSelectedUsers([]);
      }
    } catch (error) {
      toast.error('Bulk action failed');
    }
  };

  const exportData = useMemo(() => {
    return filteredUsers.map(user => ({
      Name: user.name,
      Role: user.role,
      Phone: user.phone,
      'ID Number': user.idNumber,
      Department: user.department,
      'Join Date': new Date(user.createdAt).toLocaleDateString()
    }));
  }, [filteredUsers]);

  const clearAdvancedFilters = () => {
    setAdvancedFilters({
      name: '',
      role: '',
      department: '',
      idNumber: '',
      phone: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const hasAdvancedFilters = Object.values(advancedFilters).some(value => value !== '');

  const deleteUser = async (userId, userRole) => {
    if (userRole === 'admin') {
      toast.error('Cannot delete admin accounts');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const response = await api.delete(`/admin/users/${userId}`);
        if (response.data.success) {
          toast.success('User deleted successfully');
          fetchUsers();
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800 border-red-200',
      faculty: 'bg-blue-100 text-blue-800 border-blue-200',
      staff: 'bg-green-100 text-green-800 border-green-200',
      student: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    faculty: users.filter(u => u.role === 'faculty').length,
    staff: users.filter(u => u.role === 'staff').length,
    student: users.filter(u => u.role === 'student').length
  };

  if (loading) return <Loading message="Loading users..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-32 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                <span className="text-blue-600 text-2xl">👥</span>
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">User Management</h1>
                <p className="text-gray-600 mt-2">Manage system users and their roles</p>
              </div>
              <div className="flex items-center space-x-3">
                <ExportButton data={exportData} filename="users" type="excel" />
                <DarkModeToggle />
                <button
                  onClick={() => setShowHelp(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2 font-semibold"
                >
                  <span className="text-xl">❓</span>
                  <span>Help</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-gray-600 text-sm">Total Users</div>
              </div>
              <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                <div className="text-2xl font-bold text-red-600">{stats.admin}</div>
                <div className="text-gray-600 text-sm">Admins</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{stats.faculty}</div>
                <div className="text-gray-600 text-sm">Faculty</div>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <div className="text-2xl font-bold text-green-600">{stats.staff}</div>
                <div className="text-gray-600 text-sm">Staff</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{stats.student}</div>
                <div className="text-gray-600 text-sm">Students</div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-200 mb-8"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <h2 className="text-2xl font-semibold text-gray-900">All Users ({filteredUsers.length})</h2>
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Quick search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔍
                  </div>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowAdvancedSearch(true)}
                  className={`px-6 py-2 rounded-xl font-medium transition-all ${
                    hasAdvancedFilters 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🔧 Advanced
                </button>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="faculty">Faculty</option>
                  <option value="staff">Staff</option>
                  <option value="student">Student</option>
                </select>
              </div>
              {hasAdvancedFilters && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <span>Advanced filters active</span>
                  <button
                    onClick={clearAdvancedFilters}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </div>

          <BulkActions 
            selectedItems={selectedUsers}
            onBulkAction={handleBulkAction}
            actions={[
              { key: 'delete', label: 'Delete Selected', icon: '🗑️', className: 'bg-red-100 text-red-700 hover:bg-red-200' }
            ]}
          />

          <div className="p-6">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">👥</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-gray-700 p-3">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="text-left text-gray-700 p-3">User</th>
                      <th className="text-left text-gray-700 p-3">Role</th>
                      <th className="text-left text-gray-700 p-3">Contact</th>
                      <th className="text-left text-gray-700 p-3">Department</th>
                      <th className="text-left text-gray-700 p-3">Joined</th>
                      <th className="text-left text-gray-700 p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((user, index) => (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => handleSelectUser(user._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">{user.name.charAt(0)}</span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-600">{user.idNumber}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="text-gray-900">{user.phone}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-gray-700">{user.department || 'N/A'}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-gray-700">{new Date(user.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            {user.role !== 'admin' ? (
                              <button
                                onClick={() => deleteUser(user._id, user.role)}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center space-x-1"
                              >
                                <span>🗑️</span>
                                <span>Delete</span>
                              </button>
                            ) : (
                              <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-sm">
                                Protected
                              </span>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                  hasNext={hasNext}
                  hasPrev={hasPrev}
                />
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <Chatbot isOpen={showChatbot} onClose={() => setShowChatbot(false)} />
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} page="users" />

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

      {showAdvancedSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Advanced User Search</h2>
              <button
                onClick={() => setShowAdvancedSearch(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={advancedFilters.name}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search by name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Number</label>
                <input
                  type="text"
                  value={advancedFilters.idNumber}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, idNumber: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter ID number..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={advancedFilters.role}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, role: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="faculty">Faculty</option>
                  <option value="staff">Staff</option>
                  <option value="student">Student</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <input
                  type="text"
                  value={advancedFilters.department}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, department: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search by department..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="text"
                  value={advancedFilters.phone}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search by phone..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Joined From</label>
                <input
                  type="date"
                  value={advancedFilters.dateFrom}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, dateFrom: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Joined To</label>
                <input
                  type="date"
                  value={advancedFilters.dateTo}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, dateTo: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={clearAdvancedFilters}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Clear All
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAdvancedSearch(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowAdvancedSearch(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;