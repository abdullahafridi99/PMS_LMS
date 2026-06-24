const nodemailer = require('nodemailer');
const dbService = require('./dbService');

let transporter = null;
let isSmtpConfigured = false;

if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    isSmtpConfigured = true;
    console.log('✉️ Nodemailer transporter configured successfully.');
  } catch (error) {
    console.warn('⚠️ Nodemailer setup failed. Falling back to log-based simulation.', error.message);
  }
}

const emailService = {
  sendEmail: async (to, subject, html) => {
    // Lazily require queue service to avoid circular dependency
    const queueService = require('../config/queue');
    await queueService.enqueueEmail({ to, subject, html });
  },

  processEmailJob: async (jobData) => {
    const { to, subject, html } = jobData;
    let status = 'sent';
    
    console.log(`✉️ [Mail Outbox] Sending to: ${to} | Subject: ${subject}`);
    
    if (isSmtpConfigured && transporter) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || '"PMS School" <noreply@pms.edu>',
          to,
          subject,
          html
        });
        console.log(`✅ Mail dispatched successfully to ${to} via SMTP.`);
      } catch (err) {
        console.error(`❌ SMTP mail dispatch failed to ${to}:`, err.message);
        status = 'failed';
      }
    } else {
      console.log('🤖 Simulated Email output:');
      console.log(`👉 Content (Cleaned Preview): ${html.replace(/<[^>]*>/g, ' ').substring(0, 200)}...`);
    }

    try {
      await dbService.emailLogs.create({
        recipient: to,
        subject,
        body: html,
        status,
        date: new Date()
      });
    } catch (dbErr) {
      console.error('❌ Failed to log email in database:', dbErr.message);
    }
  }
};

module.exports = emailService;
