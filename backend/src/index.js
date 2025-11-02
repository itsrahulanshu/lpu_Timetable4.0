/**
 * LPU Timetable Backend
 * Modern Express server with extracted business logic
 */

const express = require('express');
const cors = require('cors');
const { config, validateConfig } = require('./config/env');
const AuthService = require('./services/auth.service');
const TimetableService = require('./services/timetable.service');
const createTimetableRoutes = require('./routes/timetable.routes');

// Validate configuration
try {
  validateConfig();
} catch (error) {
  console.error('❌ Configuration error:', error.message);
  process.exit(1);
}

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: config.frontendUrl || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  next();
});

// Initialize services
const authService = new AuthService();
const timetableService = new TimetableService(authService);

// Routes
app.use('/api', createTimetableRoutes(authService, timetableService));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: config.env
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'LPU Timetable API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      timetable: 'GET /api/timetable',
      refresh: 'POST /api/timetable/refresh',
      status: 'GET /api/timetable/status'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('💥 Server error:', err);
  res.status(500).json({
    success: false,
    error: config.env === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
});

// Graceful shutdown
process.on('SIGTERM', () => {
  process.exit(0);
});

process.on('SIGINT', () => {
  process.exit(0);
});

module.exports = app;
