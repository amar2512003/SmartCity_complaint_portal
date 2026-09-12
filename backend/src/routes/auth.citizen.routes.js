import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware.js';
import { verifyAuth } from '../middleware/auth.middleware.js';
import {
  sendSignupOtp,
  verifySignupOtp,
  sendLoginOtp,
  verifyLoginOtp,
  updatePreferredLanguage,
} from '../controllers/auth.citizen.controller.js';

const r = Router();
// Messages here are i18n keys (namespace:key), resolved to the request's
// language by validate.middleware.js via the shared t() helper — see
// backend/src/i18n/index.js for the English/Bengali copy.
const emailSchema = z.object({ email: z.string().email('validation:email_invalid') });
const signupSchema = emailSchema.extend({ name: z.string().min(2, 'validation:name_min') });
const otpSchema = emailSchema.extend({ otp: z.string().regex(/^\d{6}$/, 'validation:otp_format') });
const preferredLanguageSchema = z.object({ language: z.enum(['en', 'bn'], { message: 'validation:language_invalid' }) });

r.post('/signup/send-otp', validate(signupSchema), sendSignupOtp);
r.post('/signup/verify-otp', validate(otpSchema), verifySignupOtp);
r.post('/login/send-otp', validate(emailSchema), sendLoginOtp);
r.post('/login/verify-otp', validate(otpSchema), verifyLoginOtp);
r.patch('/preferred-language', verifyAuth, validate(preferredLanguageSchema), updatePreferredLanguage);

export default r;
