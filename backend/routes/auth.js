const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, resetPassword, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerValidation, loginValidation, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();



router.post('/register', registerValidation, handleValidationErrors, register);

router.post('/login', loginValidation, handleValidationErrors, login);

router.get('/me', protect, getMe);
router.post('/reset-password', [
  body('phone').isMobilePhone().withMessage('Valid phone number required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], resetPassword);
router.put('/profile', protect, updateProfile);

module.exports = router;