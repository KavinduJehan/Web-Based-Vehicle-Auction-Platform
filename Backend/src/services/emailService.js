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

export async function sendNewVehicleArrivalAlert({ vehicle, buyers = [] }) {
  const mailer = getTransporter();
  const vehicleTitle = escapeHtml(vehicle.title || `${vehicle.make} ${vehicle.model} ${vehicle.year}`);
  const price = Number(vehicle.starting_price || 0).toLocaleString();
  const vehicleUrl = `${config.appBaseUrl}/vehicles/${vehicle.id}`;
  const firstImage = Array.isArray(vehicle.images) && vehicle.images[0] ? vehicle.images[0] : null;

  if (buyers.length === 0) return;

  if (!mailer) {
    if (config.env !== 'test') {
      console.info(
        `[Email Notification] New Arrival Alert for "${vehicleTitle}" ($${price}) would be sent to ${buyers.length} registered buyer(s): ${buyers.map(b => b.email).join(', ')}`
      );
    }
    return;
  }

  const emailPromises = buyers.map(buyer => {
    const safeBuyerName = escapeHtml(buyer.name || 'Valued Client');
    return mailer.sendMail({
      from: config.email.from,
      to: buyer.email,
      subject: `New Showroom Arrival: ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      text: [
        `Hello ${buyer.name || 'Valued Client'},`,
        '',
        `A new certified vehicle has just arrived in our showroom inventory:`,
        `Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        `Price: USD ${price}`,
        `Mileage: ${vehicle.mileage ? vehicle.mileage.toLocaleString() + ' km' : 'N/A'}`,
        '',
        `View complete specs and inspection report here: ${vehicleUrl}`,
        '',
        'Best regards,',
        'TAPRO AUTO Export Team'
      ].join('\n'),
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #0f2a43; padding: 24px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 1px;">TAPRO<span style="color: #fbbf24;">AUTO</span></h2>
            <p style="margin: 4px 0 0; font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 2px;">Premier Japanese Vehicle Showroom</p>
          </div>
          <div style="padding: 24px; color: #1e293b;">
            <p style="margin-top: 0; font-size: 15px;">Hello <strong>${safeBuyerName}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.5; color: #475569;">
              A certified new vehicle has just been inspected and added to our showroom inventory ready for export:
            </p>
            
            ${firstImage ? `
              <div style="margin: 16px 0; text-align: center;">
                <img src="${escapeHtml(firstImage)}" alt="${vehicleTitle}" style="max-width: 100%; border-radius: 8px; max-height: 280px; object-fit: cover;" />
              </div>
            ` : ''}

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <h3 style="margin: 0 0 10px; font-size: 18px; color: #0f172a;">${vehicleTitle}</h3>
              <p style="margin: 4px 0; font-size: 13px; color: #64748b;">
                <strong>FOB Export Price:</strong> <span style="font-size: 16px; color: #0f2a43; font-weight: bold;">USD ${price}</span>
              </p>
              ${vehicle.mileage ? `<p style="margin: 4px 0; font-size: 13px; color: #64748b;"><strong>Mileage:</strong> ${vehicle.mileage.toLocaleString()} km</p>` : ''}
              ${vehicle.grade ? `<p style="margin: 4px 0; font-size: 13px; color: #64748b;"><strong>Auction / Condition Grade:</strong> ${escapeHtml(vehicle.grade)}</p>` : ''}
              ${vehicle.chassis_number ? `<p style="margin: 4px 0; font-size: 13px; color: #64748b;"><strong>Chassis:</strong> ${escapeHtml(vehicle.chassis_number)}</p>` : ''}
            </div>

            <div style="text-align: center; margin: 24px 0;">
              <a href="${vehicleUrl}" style="background: #0f2a43; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
                Inspect Vehicle Details &amp; Request Quote
              </a>
            </div>

            <p style="font-size: 12px; color: #94a3b8; line-height: 1.4; border-top: 1px solid #f1f5f9; padding-top: 16px;">
              You received this alert because you are a registered client on TAPRO AUTO. To manage your notification preferences or schedule a direct port viewing, contact our Yokohama sales desk.
            </p>
          </div>
        </div>
      `
    }).catch(err => {
      console.error(`Failed to send vehicle alert to ${buyer.email}:`, err.message);
    });
  });

  // Execute in background
  Promise.allSettled(emailPromises);
}

