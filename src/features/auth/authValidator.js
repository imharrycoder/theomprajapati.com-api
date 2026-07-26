import { BadRequestError } from '../../errors/index.js';

/**
 * Validate the send-OTP request payload.
 */
export function validateSendOtpPayload(body) {
  const { email, contact } = body;

  if (!email && !contact) {
    throw new BadRequestError('Email or contact is required to send OTP');
  }

  return { email, contact };
}
