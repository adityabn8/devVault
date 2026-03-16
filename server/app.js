const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');
const { globalLimiter } = require('./middleware/rateLimit');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const vaultRoutes = require('./routes/vaults');
const profileRoutes = require('./routes/profile');
const resourceRoutes = require('./routes/resources');
const dashboardRoutes = require('./routes/dashboard');
const searchRoutes = require('./routes/search');
const Resource = require('./models/Resource');

const app = express();

const ALLOWED_ORIGINS = new Set([
  process.env.CLIENT_URL || 'http://localhost:3000',
]);

app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin, whitelisted origins, and browser extensions
    if (!origin || ALLOWED_ORIGINS.has(origin) || /^chrome-extension:\/\//.test(origin) || /^moz-extension:\/\//.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(globalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/vaults', vaultRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/search', searchRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public shared vault endpoint
app.get('/api/shared/:token', async (req, res) => {
  try {
    const Vault = require('./models/Vault');
    const vault = await Vault.findOne({ shareLink: req.params.token, isPublic: true })
      .populate('owner', 'username avatarUrl displayName');
    if (!vault) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'This share link is invalid or has been deactivated.' } });
    }
    const resources = await Resource.find({ vault: vault._id }).sort({ createdAt: -1 });
    res.json({ vault, resources });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Server error' } });
  }
});

app.use(errorHandler);

module.exports = app;
