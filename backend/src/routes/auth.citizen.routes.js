import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware.js';
import { sendSignupOtp, verifySignupOtp, sendLoginOtp, verifyLoginOtp } from '../controllers/auth.citizen.controller.js';

const r = Router();
const emailSchema = z.object({ email: z.string().email() });
const signupSchema = emailSchema.extend({ name: z.string().min(2) });
const otpSchema = emailSchema.extend({ otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits') });

r.post('/signup/send-otp', validate(signupSchema), sendSignupOtp);
r.post('/signup/verify-otp', validate(otpSchema), verifySignupOtp);
r.post('/login/send-otp', validate(emailSchema), sendLoginOtp);
r.post('/login/verify-otp', validate(otpSchema), verifyLoginOtp);

export default r;
