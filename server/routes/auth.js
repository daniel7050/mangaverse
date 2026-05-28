const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '30d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: 'All fields are required' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing)
      return res.status(409).json({ error: 'Username or email already taken' });

    const user = await User.create({ username, email, password });
    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: { _id: user._id, username: user.username, email: user.email, avatar: user.avatar }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid email or password' });

    const token = signToken(user._id);
    res.json({
      token,
      user: { _id: user._id, username: user.username, email: user.email, avatar: user.avatar }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({
    _id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    avatar: req.user.avatar
  });
});

module.exports = router;
