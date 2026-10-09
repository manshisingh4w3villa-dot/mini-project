const express = require('express');
const cors = require('cors');
const { isAllowedFrontendOrigin } = require('./config/urls');

const authRoutes = require('./routes/authRoutes');
const locationRoutes = require('./routes/locationRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const profileRoutes = require('./routes/profileRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const cronRoutes = require('./routes/cronRoutes');
const paymentController = require('./controllers/paymentController');

const app = express();
app.use(cors({
  origin(origin, callback) {
    if (!origin || isAllowedFrontendOrigin(origin)) return callback(null, true);
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cron', cronRoutes);

app.get('/health', async (req, res, next) => {
  try {
    const pool = require('./config/db');
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error);
  if (error instanceof require('multer').MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE' ? 'Profile image must be 5 MB or smaller' : error.message;
    return res.status(400).json({ error: message });
  }
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({ error: error.message });
  }
  if (error.message?.startsWith('Cloudinary config is missing')) {
    return res.status(503).json({ error: error.message });
  }
  if (error.statusCode && error.message?.startsWith('Cloudinary rejected')) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  if (error.statusCode) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;