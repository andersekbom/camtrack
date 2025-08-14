const app = require('./app');

const PORT = process.env.PORT || 3000;

// Initialize job queue service
const jobQueue = require('./services/JobQueueService');
console.log('✅ Job Queue Service initialized');

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log('🔄 Background job processing started');
});