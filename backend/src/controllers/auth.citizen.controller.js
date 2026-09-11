import { findUserByEmail, createUser } from '../models/user.model.js';
import { db } from '../config/db.js';
import { deletePendingSignup, createPendingSignup, findPendingSignup, incrementAttempts, deleteOtp } from '../models/otp.model.js';
import { hashPassword, comparePassword } from '../utils/hash.util.js';
import { signToken } from '../utils/jwt.util.js';
import { generateOtp } from '../utils/otp.util.js';
import { sendOtpEmail } from '../utils/email.util.js';
import { ok, fail } from '../utils/apiResponse.util.js';

async function createOtp(email, name, purpose) {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await db('email_otps').where({ email, purpose }).del();
  await createPendingSignup({
    email,
    name: name || '',
    passwordHash: null,
    otpHash: await hashPassword(otp),
    expiresAt,
    purpose
  });
  await sendOtpEmail({ to: email, otp, name });
}

export async function sendSignupOtp(req, res) {
  try {
    const { name, email } = req.body;
    if (await findUserByEmail(email)) return fail(res, 'Email already registered', 409);
    await createOtp(email, name, 'signup');
    return ok(res, { email, expiresInSeconds: 600 }, 'OTP sent to your email');
  } catch (e) {
    console.error('sendSignupOtp:', e);
    return fail(res, 'Unable to send OTP. Check the email service configuration.', 500);
  }
}

export async function verifySignupOtp(req, res) {
  try {
    const { email, otp } = req.body;
    const pending = await findPendingSignup(email, 'signup');
    if (!pending) return fail(res, 'No active OTP request found. Please request a new OTP.', 400);
    if (new Date(pending.expires_at).getTime() < Date.now()) {
      await deleteOtp(pending.id);
      return fail(res, 'OTP has expired. Please request a new one.', 400);
    }
    if (pending.attempts >= 5) {
      await deleteOtp(pending.id);
      return fail(res, 'Too many incorrect attempts. Please request a new OTP.', 429);
    }
    if (!(await comparePassword(otp, pending.otp_hash))) {
      await incrementAttempts(pending.id);
      return fail(res, 'Incorrect OTP. Please try again.', 400);
    }
    if (await findUserByEmail(email)) {
      await deleteOtp(pending.id);
      return fail(res, 'Email already registered', 409);
    }
    const user = await createUser({ name: pending.name, email: pending.email, passwordHash: null });
    await deleteOtp(pending.id);
    const token = signToken({ id: user.id, name: user.name, email: user.email, role: user.role });
    return ok(res, { user, token }, 'Email verified and account created');
  } catch (e) {
    console.error('verifySignupOtp:', e);
    return fail(res, e.message, 500);
  }
}

export async function sendLoginOtp(req, res) {
  try {
    const { email } = req.body;
    const user = await findUserByEmail(email);
    if (!user || user.role !== 'citizen') return fail(res, 'No citizen account found with this email', 404);
    await createOtp(email, user.name, 'login');
    return ok(res, { email, expiresInSeconds: 600 }, 'OTP sent to your email');
  } catch (e) {
    console.error('sendLoginOtp:', e);
    return fail(res, 'Unable to send OTP. Check the email service configuration.', 500);
  }
}

export async function verifyLoginOtp(req, res) {
  try {
    const { email, otp } = req.body;
    const pending = await findPendingSignup(email, 'login');
    if (!pending) return fail(res, 'No active OTP request found. Please request a new OTP.', 400);
    if (new Date(pending.expires_at).getTime() < Date.now()) {
      await deleteOtp(pending.id);
      return fail(res, 'OTP has expired. Please request a new one.', 400);
    }
    if (pending.attempts >= 5) {
      await deleteOtp(pending.id);
      return fail(res, 'Too many incorrect attempts. Please request a new OTP.', 429);
    }
    if (!(await comparePassword(otp, pending.otp_hash))) {
      await incrementAttempts(pending.id);
      return fail(res, 'Incorrect OTP. Please try again.', 400);
    }
    const user = await findUserByEmail(email);
    await deleteOtp(pending.id);
    if (!user || user.role !== 'citizen') return fail(res, 'Citizen account not found', 404);
    const token = signToken({ id: user.id, name: user.name, email: user.email, role: user.role });
    return ok(res, { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token }, 'Login successful');
  } catch (e) {
    console.error('verifyLoginOtp:', e);
    return fail(res, e.message, 500);
  }
}