const { body, validationResult } = require('express-validator');

// Input sanitization and validation
const sanitizeInput = (value) => {
  if (typeof value !== 'string') return value;
  return value
    .replace(/[<>\"'&\\/\\\\]/g, (match) => {
      const entities = { 
        '<': '&lt;', 
        '>': '&gt;', 
        '\"': '&quot;', 
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

// Validation rules
const registerValidation = [
  body('name').isLength({ min: 2, max: 50 }).customSanitizer(sanitizeInput),
  body('phone').isMobilePhone().customSanitizer(sanitizeInput),
  body('password').isLength({ min: 6, max: 100 }),
  body('idNumber').isLength({ min: 3, max: 20 }).customSanitizer(sanitizeInput),
  body('department').optional().isLength({ max: 50 }).customSanitizer(sanitizeInput)
];

const loginValidation = [
  body('identifier').isLength({ min: 3, max: 20 }).customSanitizer(sanitizeInput),
  body('password').isLength({ min: 6, max: 100 })
];

const grievanceValidation = [
  body('title').isLength({ min: 5, max: 100 }).customSanitizer(sanitizeInput),
  body('description').isLength({ min: 10, max: 1000 }).customSanitizer(sanitizeInput),
  body('category').isIn(['academic', 'administrative', 'facility', 'harassment', 'technical', 'other']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical'])
];

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  registerValidation,
  loginValidation,
  grievanceValidation,
  handleValidationErrors,
  sanitizeInput
};