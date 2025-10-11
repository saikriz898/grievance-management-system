import { jwtDecode } from 'jwt-decode';

export const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const getUserFromToken = (token) => {
  if (!isTokenValid(token)) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

export const hasRole = (userRole, requiredRoles) => {
  return requiredRoles.includes(userRole);
};

export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/user/login-selection';
};