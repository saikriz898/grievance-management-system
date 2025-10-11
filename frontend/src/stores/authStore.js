import { create } from 'zustand';

const parseUserData = () => {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

const isValidToken = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

const useAuthStore = create((set, get) => {
  return {
    user: null,
    token: null,
    isAuthenticated: false,

    login: (user, token) => {
      // Sanitize user data to prevent XSS
      const sanitizeString = (str) => {
        if (!str || typeof str !== 'string') return str;
        return str
          .replace(/[<>"'&\/\\]/g, (match) => {
            const entities = { 
              '<': '&lt;', 
              '>': '&gt;', 
              '"': '&quot;', 
              "'": '&#x27;', 
              '&': '&amp;',
              '/': '&#x2F;',
              '\\': '&#x5C;'
            };
            return entities[match] || match;
          })
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '')
          .trim();
      };
      
      const sanitizedUser = {
        ...user,
        name: sanitizeString(user.name),
        department: sanitizeString(user.department),
        idNumber: sanitizeString(user.idNumber),
        phone: sanitizeString(user.phone)
      };
      localStorage.setItem('user', JSON.stringify(sanitizedUser));
      localStorage.setItem('token', token);
      set({ user: sanitizedUser, token, isAuthenticated: true });
    },

    logout: () => {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      sessionStorage.clear();
      set({ user: null, token: null, isAuthenticated: false });
      
      // Redirect to role selection page
      window.location.href = '/role-selection';
    },

    clearSession: () => {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      sessionStorage.clear();
      set({ user: null, token: null, isAuthenticated: false });
      window.location.href = '/role-selection';
    },

    updateUser: (userData) => {
      try {
        const updatedUser = { ...get().user, ...userData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        set({ user: updatedUser });
      } catch (error) {
        console.error('Failed to update user data:', error);
      }
    },

    restoreSession: () => {
      const token = localStorage.getItem('token');
      const user = parseUserData();
      if (isValidToken(token) && user) {
        set({ user, token, isAuthenticated: true });
        return true;
      }
      return false;
    }
  };
});

export { useAuthStore };