import app from './app';
import dotenv from 'dotenv';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

// Get port from environment or use default
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Start server - listen on all interfaces for production (Render, etc.)
const HOST = NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
const server = app.listen(PORT, HOST, () => {
  logger.info(`🚀 Server running in ${NODE_ENV} mode`);
  logger.info(`📡 Listening on ${HOST}:${PORT}`);
  logger.info(`🏥 Health check: http://${HOST}:${PORT}/health`);
  logger.info(`📚 API Docs: http://${HOST}:${PORT}/api/docs`);
  logger.info(`📊 Metrics: http://${HOST}:${PORT}/api/metrics`);
  
  if (NODE_ENV === 'development') {
    logger.info(`🌐 Frontend: ${FRONTEND_URL}`);
  }
});

// Graceful shutdown handler
const gracefulShutdown = (signal: string) => {
  logger.info(`\n${signal} signal received: closing HTTP server`);
  
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Close database connections, redis, etc. here
    // await db.close();
    // await redis.quit();
    
    logger.info('✅ Graceful shutdown completed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('❌ Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('💥 Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

export default server;