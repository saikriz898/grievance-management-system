const express = require('express');
const { protect } = require('../middleware/auth');
const LoginMonitor = require('../utils/loginMonitor');

const router = express.Router();

// Get user's own login history
router.get('/login-history', protect, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const history = await LoginMonitor.getUserLoginHistory(req.user.id, parseInt(limit));
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's active sessions
router.get('/active-sessions', protect, async (req, res) => {
  try {
    const sessions = await LoginMonitor.getActiveUserSessions(req.user.id);
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Logout from specific session
router.post('/logout-session/:sessionId', protect, async (req, res) => {
  try {
    await LoginMonitor.logoutUser(req.user.id, req.params.sessionId);
    res.json({ success: true, message: 'Session terminated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;