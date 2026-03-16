const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('../config/passport');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/auth/github
router.get('/github', passport.authenticate('github', { session: false, scope: ['read:user', 'user:email'] }));

// GET /api/auth/github/callback
router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed` }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
);

// GET /api/auth/extension-token
// Called by the browser extension after the user is already logged in via the web app.
// Exchanges the valid session cookie for a long-lived Bearer token the extension can store.
router.get('/extension-token', authMiddleware, (req, res) => {
  const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: req.user });
});

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
