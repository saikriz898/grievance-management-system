// Utility to clear authentication data
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.clear();
  
  // Clear any cookies if they exist
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });
  
  console.log('Authentication data cleared');
};

// Force logout and redirect
export const forceLogout = () => {
  clearAuthData();
  window.location.href = '/';
};