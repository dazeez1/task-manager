const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import routes
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Environment-based configuration
const isProduction = process.env.NODE_ENV === 'production';
const sessionSecret = process.env.SESSION_SECRET || 'task-manager-secret-key-2024';

// CORS configuration - properly configured for production
const corsOptions = {
  origin: isProduction 
    ? ['https://task-manager-rho-virid.vercel.app', 'http://localhost:3000', 'http://localhost:5500']
    : ['http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:3000', 'http://127.0.0.1:5500'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  preflightContinue: false,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction, // Use secure cookies in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: isProduction ? 'none' : 'lax'
    }
  })
);

// API routes only
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    service: 'Task Manager API',
    version: '2.0.0',
    cors: {
      allowedOrigins: corsOptions.origin,
      credentials: corsOptions.credentials
    }
  });
});

// API info endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Task Manager API',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      tasks: '/api/tasks',
      health: '/health'
    },
    documentation: 'https://github.com/dazeez1/task-manager',
    cors: {
      allowedOrigins: corsOptions.origin,
      credentials: corsOptions.credentials
    }
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found',
    path: req.originalUrl,
    availableEndpoints: ['/api/auth', '/api/tasks']
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: isProduction ? 'Internal server error' : err.message,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Task Manager API Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🌐 CORS Origins: ${corsOptions.origin.join(', ')}`);
  if (isProduction) {
    console.log(`🚀 Production mode enabled`);
    console.log(`📚 API-only deployment - no frontend files served`);
  }
});
