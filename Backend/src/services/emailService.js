import nodemailer from 'nodemailer';
import config from '../config/index.js';

let transporter;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getTransporter() {
  if (!config.email.host) {
    if (config.env === 'production') {
      const err = new Error('SMTP is not configured');
      err.status = 500;
      throw err;
    }
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: config.email.user && config.email.pass
        ? { user: config.email.user, pass: config.email.pass }
        : undefined
    });
  }

  return transporter;
}

export async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const mailer = getTransporter();
  const safeName = escapeHtml(name || 'there');
  const safeResetUrl = escapeHtml(resetUrl);

  if (!mailer) {
    if (config.env !== 'test') {
      console.info(`Password reset link for ${to}: ${resetUrl}`);
    }
    return;
  }

  await mailer.sendMail({
    from: config.email.from,
    to,
    subject: 'Reset your password',
    text: [
      `Hello ${name || 'there'},`,
      '',
      'We received a request to reset your password.',
      `Open this link to choose a new password: ${resetUrl}`,
      '',
      'If you did not request this, you can ignore this email.'
    ].join('\n'),
    html: `
      <p>Hello ${safeName},</p>
      <p>We received a request to reset your password.</p>
      <p><a href="${safeResetUrl}">Reset your password</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    `
  });
}
