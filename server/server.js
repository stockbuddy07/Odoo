// Server Entry Point
const App = require('./app');

const app = new App();

// Start the server
app.start().catch(error => {
  console.error('❌ Failed to start GearGuard ERP Server:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception thrown:', error);
  process.exit(1);
});
