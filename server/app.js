// Main Express Application Setup
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import middleware
const { globalErrorHandler, notFound } = require('./middleware/error.middleware');

// Import routes
const authRoutes = require('./modules/auth/auth.routes');
const equipmentRoutes = require('./modules/equipment/equipment.routes');
const maintenanceRoutes = require('./modules/maintenance/maintenance.routes');
const teamsRoutes = require('./modules/teams/team.routes');

// Import database config
const { testConnection } = require('./config/db.config');

class App {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      }
    }));

    // CORS configuration
    const corsOptions = {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
      optionsSuccessStatus: 200
    };
    this.app.use(cors(corsOptions));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use('/api/', limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression middleware
    this.app.use(compression());

    // Logging middleware
    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'GearGuard ERP API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      });
    });
  }

  setupRoutes() {
    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/equipment', equipmentRoutes);
    this.app.use('/api/maintenance', maintenanceRoutes);
    this.app.use('/api/teams', teamsRoutes);

    // API documentation endpoint
    this.app.get('/api', (req, res) => {
      res.json({
        success: true,
        message: 'GearGuard ERP API',
        version: '1.0.0',
        endpoints: {
          authentication: '/api/auth',
          equipment: '/api/equipment',
          maintenance: '/api/maintenance',
          teams: '/api/teams'
        },
        documentation: 'https://github.com/your-repo/gearguard-erp'
      });
    });

    // Serve static files (for frontend build in production)
    this.app.use(express.static('client/dist'));

    // Catch all handler: send back React's index.html file for client-side routing
    this.app.get('*', (req, res) => {
      res.sendFile('index.html', { root: 'client/dist' });
    });
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use(notFound);

    // Global error handler
    this.app.use(globalErrorHandler);
  }

  async start() {
    try {
      // Test database connection
      const dbConnected = await testConnection();
      if (!dbConnected) {
        console.error('❌ Failed to connect to database');
        process.exit(1);
      }

      const PORT = process.env.PORT || 5000;
      
      this.server = this.app.listen(PORT, () => {
        console.log(`🚀 GearGuard ERP Server running on port ${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
        console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      });

      // Graceful shutdown
      process.on('SIGTERM', this.gracefulShutdown.bind(this));
      process.on('SIGINT', this.gracefulShutdown.bind(this));

      return this.server;
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  gracefulShutdown(signal) {
    console.log(`\n📴 Received ${signal}. Starting graceful shutdown...`);
    
    if (this.server) {
      this.server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  }

  getApp() {
    return this.app;
  }
}

module.exports = App;
