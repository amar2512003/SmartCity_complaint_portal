import { Router } from 'express'; import { z } from 'zod'; import { validate } from '../middleware/validate.middleware.js'; import { loginAdmin } from '../controllers/auth.admin.controller.js';
// Messages are i18n keys (namespace:key), resolved by validate.middleware.js.
const loginSchema = z.object({ email: z.string().email('validation:email_invalid'), password: z.string().min(6, 'validation:password_min') });
const r=Router(); r.post('/login',validate(loginSchema),loginAdmin); export default r;
