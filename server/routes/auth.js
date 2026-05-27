const router = require('express').Router();

/**
 * AUTH ROUTES — Assigned to: Hamzat Olajuwon (@juwonabdullahi007-arc)
 *
 * TODO: Implement the following:
 *   POST /api/auth/register  — create new user, return JWT
 *   POST /api/auth/login     — validate credentials, return JWT
 *   GET  /api/auth/me        — return current user profile (protected)
 *
 * Hint: Use the User model in ../models/User.js
 * Hint: Use bcryptjs to compare passwords and jsonwebtoken to sign tokens
 * Hint: See ../middleware/auth.js for the protect middleware
 */

router.post('/register', (req, res) => {
  res.status(501).json({ message: 'TODO: Hamzat — implement register endpoint' });
});

router.post('/login', (req, res) => {
  res.status(501).json({ message: 'TODO: Hamzat — implement login endpoint' });
});

router.get('/me', (req, res) => {
  res.status(501).json({ message: 'TODO: Hamzat — implement /me endpoint (protected)' });
});

module.exports = router;
