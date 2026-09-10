import { db } from '../config/db.js';

export const deletePendingSignup = (email, purpose = 'signup') =>
  db('email_otps').where({ email, purpose }).del();

export const createPendingSignup = ({ email, name, passwordHash, otpHash, expiresAt, purpose = 'signup' }) =>
  db('email_otps').insert({
    email,
    name,
    password_hash: passwordHash,
    otp_hash: otpHash,
    purpose,
    expires_at: expiresAt,
    attempts: 0
  });

export const findPendingSignup = (email, purpose = 'signup') =>
  db('email_otps').where({ email, purpose }).orderBy('id', 'desc').first();

export const incrementAttempts = (id) => db('email_otps').where({ id }).increment('attempts', 1);
export const deleteOtp = (id) => db('email_otps').where({ id }).del();
