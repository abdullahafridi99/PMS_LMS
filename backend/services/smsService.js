const dbService = require('./dbService');

let twilioClient = null;
let isTwilioConfigured = false;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    isTwilioConfigured = true;
    console.log('📱 Twilio client configured successfully.');
  } catch (error) {
    console.warn('⚠️ Twilio module failed to load. Fallback log enabled.');
  }
}

const smsService = {
  sendSms: async (phone, message, type = 'absentee_alert', recipient = 'Parent') => {
    const queueService = require('../config/queue');
    await queueService.enqueueSms({ phone, message, type, recipient });
  },

  processSmsJob: async (jobData) => {
    const { phone, message, type, recipient } = jobData;
    let status = 'sent';

    console.log(`📱 [SMS Outbox] Target: ${phone} | Recipient: ${recipient} | Type: ${type}`);
    console.log(`💬 Message: "${message}"`);

    if (isTwilioConfigured && twilioClient) {
      try {
        await twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
          to: phone
        });
        console.log(`✅ SMS dispatched successfully to ${phone} via Twilio.`);
      } catch (err) {
        console.error(`❌ Twilio SMS dispatch failed to ${phone}:`, err.message);
        status = 'failed';
      }
    } else {
      console.log('🤖 Simulated SMS logs output written to mock DB.');
    }

    try {
      await dbService.smsLogs.create({
        recipient,
        phone,
        message,
        type,
        status,
        date: new Date()
      });
    } catch (dbErr) {
      console.error('❌ Failed to log SMS in database:', dbErr.message);
    }
  },

  // Templates
  templates: {
    getAbsenteeMsg: (studentName, date, lang = 'ur') => {
      if (lang === 'ur') {
        return `محترم والدین، ${studentName} آج ${date} کو سکول سے غیر حاضر رہا۔ پی ایم ایس سکول۔`;
      }
      return `Dear Parent, ${studentName} was marked absent on ${date}. PMS School.`;
    },
    getLateMsg: (studentName, time, date, lang = 'ur') => {
      if (lang === 'ur') {
        return `محترم والدین، ${studentName} آج ${date} کو صبح ${time} بجے سکول دیر سے پہنچا۔ پی ایم ایس سکول۔`;
      }
      return `Dear Parent, ${studentName} arrived late to school at ${time} on ${date}. PMS School.`;
    },
    getAnnouncementMsg: (title, date) => {
      return `Important announcement from PMS School: "${title}" posted on ${date}. Please check the Parent Dashboard.`;
    }
  }
};

module.exports = smsService;
