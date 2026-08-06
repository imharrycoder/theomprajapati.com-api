import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { getOptionalEnv } from '../config/environment.js';
import logger from './logger.js';

let transporter = null;
let resendClient = null;

/* 
// Nodemailer SMTP fallback (commented out per request)
function getTransporter() {
  if (transporter) return transporter;

  const email = getOptionalEnv('SMTP_EMAIL', '');
  const password = getOptionalEnv('SMTP_PASSWORD', '');

  if (!email || !password) {
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: email,
      pass: password,
    },
  });

  return transporter;
}
*/

function getResendClient() {
  if (resendClient) return resendClient;
  
  const apiKey = getOptionalEnv('RESEND_API_KEY', '');
  if (!apiKey) {
    return null;
  }

  resendClient = new Resend(apiKey);
  return resendClient;
}

/**
 * Send an OTP verification email.
 * @param {string} toEmail - Recipient email address
 * @param {string} otp - The 6-digit OTP code
 */
export async function sendOtpEmail(toEmail, otp) {
  const resend = getResendClient();

  if (!resend) {
    logger.warn(`Email not sent to ${toEmail} — Resend API key is not configured.`);
    return false;
  }

  // Since the domain is now verified on Resend, we can send from it.
  // Using an environment variable so it can be customized later if needed.
  const fromEmail = getOptionalEnv('RESEND_FROM_EMAIL', 'noreply@theomprajapati.com');

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0a; border-radius: 16px; overflow: hidden; border: 1px solid #1a1a2e;">
      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px 24px; text-align: center;">
        <h1 style="margin: 0; color: #fff; font-size: 24px; font-weight: 800; letter-spacing: 1px;">The Om Prajapati</h1>
        <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Email Verification</p>
      </div>
      <div style="padding: 32px 24px;">
        <p style="color: #d1d5db; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
          Use the following code to verify your email address. This code will expire in <strong style="color: #a5b4fc;">5 minutes</strong>.
        </p>
        <div style="background: #111827; border: 2px solid #6366f1; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #a5b4fc;">${otp}</span>
        </div>
        <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0;">
          If you didn't request this code, you can safely ignore this email. Do not share this code with anyone.
        </p>
      </div>
      <div style="background: #111827; padding: 16px 24px; text-align: center; border-top: 1px solid #1f2937;">
        <p style="margin: 0; color: #4b5563; font-size: 12px;">© ${new Date().getFullYear()} The Om Prajapati. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    // Use Resend exclusively
    await resend.emails.send({
      from: `The Om Prajapati <${fromEmail}>`,
      to: [toEmail],
      subject: `${otp} — Your Verification Code`,
      html: htmlContent,
    });
    logger.info(`OTP email sent to ${toEmail} via Resend`);
    
    /* 
    // SMTP fallback commented out
    else {
      await mailer.sendMail({
        from: `"The Om Prajapati" <${fromEmail}>`,
        to: toEmail,
        subject: `${otp} — Your Verification Code`,
        html: htmlContent,
      });
      logger.info(`OTP email sent to ${toEmail} via SMTP`);
    }
    */

    return true;
  } catch (err) {
    logger.error(`Failed to send OTP email to ${toEmail}:`, err.message);
    return false;
  }
}
