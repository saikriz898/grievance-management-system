const crypto = require('crypto');

// Simple CSRF protection middleware
const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET requests and API testing in development
  if (req.method === 'GET' || process.env.NODE_ENV === 'development') {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;

  // Generate token if not exists
  if (!sessionToken) {
    req.session = req.session || {};
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }

  // Validate token for non-GET requests
  if (token && token === sessionToken) {
    return next();
  }

  // Allow requests from same origin
  const origin = req.get('Origin') || req.get('Referer');
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL
  ].filter(Boolean);

  if (origin && allowedOrigins.some(allowed => origin.startsWith(allowed))) {
    return next();
  }

  res.status(403).json({ 
    success: false, 
    message: 'CSRF token validation failed' 
  });
};

module.exports = csrfProtection;