import { Router } from 'express'; import { z } from 'zod'; import { validate } from '../middleware/validate.middleware.js'; import { loginAdmin } from '../controllers/auth.admin.controller.js';
const r=Router(); r.post('/login',validate(z.object({email:z.string().email(),password:z.string().min(6)})),loginAdmin); export default r;
