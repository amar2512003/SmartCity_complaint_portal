import { findUserByEmail, createUser, updatePreferredLanguage as updatePreferredLanguageInDb } from '../models/user.model.js';
import { db } from '../config/db.js';
import { deletePendingSignup, createPendingSignup, findPendingSignup, incrementAttempts, deleteOtp } from '../models/otp.model.js';
import { hashPassword, comparePassword } from '../utils/hash.util.js';
import { signToken } from '../utils/jwt.util.js';
import { generateOtp } from '../utils/otp.util.js';
import { sendOtpEmail } from '../utils/email.util.js';
import { ok, fail } from '../utils/apiResponse.util.js';
import { t } from '../i18n/index.js';

// `lang` picks the OTP email's copy. Signup has no user record yet, so the
// caller passes the language of the request itself (req.lang); login passes
// the citizen's saved preferred_language, falling back to req.lang.
async function createOtp(email, name, purpose, lang) {
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
  await sendOtpEmail({ to: email, otp, name, lang });
}

export async function sendSignupOtp(req, res) {
  try {
    const { name, email } = req.body;
    if (await findUserByEmail(email)) return fail(res, t('auth:email_already_registered', req.lang), 409);
    await createOtp(email, name, 'signup', req.lang);
    return ok(res, { email, expiresInSeconds: 600 }, t('auth:otp_sent', req.lang));
  } catch (e) {
    console.error('sendSignupOtp:', e);
    return fail(res, t('auth:otp_send_failed', req.lang), 500);
  }
}

export async function verifySignupOtp(req, res) {
  try {
    const { email, otp } = req.body;
    const pending = await findPendingSignup(email, 'signup');
    if (!pending) return fail(res, t('auth:no_active_otp', req.lang), 400);
    if (new Date(pending.expires_at).getTime() < Date.now()) {
      await deleteOtp(pending.id);
      return fail(res, t('auth:otp_expired', req.lang), 400);
    }
    if (pending.attempts >= 5) {
      await deleteOtp(pending.id);
      return fail(res, t('auth:too_many_attempts', req.lang), 429);
    }
    if (!(await comparePassword(otp, pending.otp_hash))) {
      await incrementAttempts(pending.id);
      return fail(res, t('auth:incorrect_otp', req.lang), 400);
    }
    if (await findUserByEmail(email)) {
      await deleteOtp(pending.id);
      return fail(res, t('auth:email_already_registered', req.lang), 409);
    }
    // The citizen was signing up in this language, so save it as their
    // preferred_language right away rather than leaving the column default.
    const user = await createUser({ name: pending.name, email: pending.email, passwordHash: null });
    await updatePreferredLanguageInDb(user.id, req.lang);
    await deleteOtp(pending.id);
    const token = signToken({ id: user.id, name: user.name, email: user.email, role: user.role });
    return ok(res, { user: { ...user, preferred_language: req.lang }, token }, t('auth:signup_success', req.lang));
  } catch (e) {
    console.error('verifySignupOtp:', e);
    return fail(res, e.message, 500);
  }
}

export async function sendLoginOtp(req, res) {
  try {
    const { email } = req.body;
    const user = await findUserByEmail(email);
    if (!user || user.role !== 'citizen') return fail(res, t('auth:no_citizen_account', req.lang), 404);
    await createOtp(email, user.name, 'login', user.preferred_language || req.lang);
    return ok(res, { email, expiresInSeconds: 600 }, t('auth:otp_sent', req.lang));
  } catch (e) {
    console.error('sendLoginOtp:', e);
    return fail(res, t('auth:otp_send_failed', req.lang), 500);
  }
}

export async function verifyLoginOtp(req, res) {
  try {
    const { email, otp } = req.body;
    const pending = await findPendingSignup(email, 'login');
    if (!pending) return fail(res, t('auth:no_active_otp', req.lang), 400);
    if (new Date(pending.expires_at).getTime() < Date.now()) {
      await deleteOtp(pending.id);
      return fail(res, t('auth:otp_expired', req.lang), 400);
    }
    if (pending.attempts >= 5) {
      await deleteOtp(pending.id);
      return fail(res, t('auth:too_many_attempts', req.lang), 429);
    }
    if (!(await comparePassword(otp, pending.otp_hash))) {
      await incrementAttempts(pending.id);
      return fail(res, t('auth:incorrect_otp', req.lang), 400);
    }
    const user = await findUserByEmail(email);
    await deleteOtp(pending.id);
    if (!user || user.role !== 'citizen') return fail(res, t('auth:citizen_account_not_found', req.lang), 404);
    const token = signToken({ id: user.id, name: user.name, email: user.email, role: user.role });
    return ok(
      res,
      { user: { id: user.id, name: user.name, email: user.email, role: user.role, preferred_language: user.preferred_language }, token },
      t('auth:login_success', req.lang)
    );
  } catch (e) {
    console.error('verifyLoginOtp:', e);
    return fail(res, e.message, 500);
  }
}

export async function updatePreferredLanguage(req, res) {
  try {
    const { language } = req.body;
    const user = await updatePreferredLanguageInDb(req.user.id, language);
    return ok(res, { preferred_language: user.preferred_language }, t('auth:preferred_language_updated', language));
  } catch (e) {
    console.error('updatePreferredLanguage:', e);
    return fail(res, e.message, 500);
  }
}