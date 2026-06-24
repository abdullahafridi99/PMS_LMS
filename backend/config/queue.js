const { Queue, Worker } = require('bullmq');
const cacheService = require('./redis');

// Lazy load email and SMS service handlers to avoid circular dependencies
let emailServiceInstance = null;
let smsServiceInstance = null;

const getEmailService = () => {
  if (!emailServiceInstance) {
    emailServiceInstance = require('../services/emailService');
  }
  return emailServiceInstance;
};

const getSmsService = () => {
  if (!smsServiceInstance) {
    smsServiceInstance = require('../services/smsService');
  }
  return smsServiceInstance;
};

let emailQueue = null;
let smsQueue = null;

const REDIS_CONNECTION_CONFIG = cacheService.getClient();

if (cacheService.isConnected() && REDIS_CONNECTION_CONFIG) {
  try {
    emailQueue = new Queue('emailQueue', { connection: REDIS_CONNECTION_CONFIG });
    smsQueue = new Queue('smsQueue', { connection: REDIS_CONNECTION_CONFIG });

    // Initialize Workers
    const emailWorker = new Worker('emailQueue', async (job) => {
      console.log(`🤖 [Worker] Processing email job ${job.id} for ${job.data.to}...`);
      const emailService = getEmailService();
      await emailService.processEmailJob(job.data);
    }, { connection: REDIS_CONNECTION_CONFIG });

    const smsWorker = new Worker('smsQueue', async (job) => {
      console.log(`🤖 [Worker] Processing SMS job ${job.id} for ${job.data.phone}...`);
      const smsService = getSmsService();
      await smsService.processSmsJob(job.data);
    }, { connection: REDIS_CONNECTION_CONFIG });

    emailWorker.on('completed', (job) => console.log(`✅ [Worker] Email job ${job.id} completed.`));
    emailWorker.on('failed', (job, err) => console.error(`❌ [Worker] Email job ${job.id} failed:`, err.message));
    
    smsWorker.on('completed', (job) => console.log(`✅ [Worker] SMS job ${job.id} completed.`));
    smsWorker.on('failed', (job, err) => console.error(`❌ [Worker] SMS job ${job.id} failed:`, err.message));
    
    console.log('⚡ BullMQ background workers initialized successfully.');
  } catch (error) {
    console.error('❌ Failed to initialize BullMQ:', error.message);
  }
} else {
  console.log('⚠️ Redis is not available. Queue service running in Synchronous (Direct-Execution) Fallback Mode.');
}

const queueService = {
  enqueueEmail: async (data) => {
    if (emailQueue) {
      try {
        await emailQueue.add('sendEmail', data, { removeOnComplete: true });
        console.log(`📥 Enqueued email job for ${data.to} into BullMQ.`);
        return;
      } catch (err) {
        console.warn('⚠️ BullMQ enqueue failed. Falling back to direct execution.');
      }
    }
    // Synchronous direct fallback
    const emailService = getEmailService();
    await emailService.processEmailJob(data);
  },

  enqueueSms: async (data) => {
    if (smsQueue) {
      try {
        await smsQueue.add('sendSms', data, { removeOnComplete: true });
        console.log(`📥 Enqueued SMS job for ${data.phone} into BullMQ.`);
        return;
      } catch (err) {
        console.warn('⚠️ BullMQ enqueue failed. Falling back to direct execution.');
      }
    }
    // Synchronous direct fallback
    const smsService = getSmsService();
    await smsService.processSmsJob(data);
  }
};

module.exports = queueService;
