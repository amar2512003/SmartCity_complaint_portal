import { Router } from 'express'; import { z } from 'zod'; import { verifyAuth } from '../middleware/auth.middleware.js'; import { requireRole } from '../middleware/role.middleware.js'; import { validate } from '../middleware/validate.middleware.js'; import * as c from '../controllers/admin.controller.js';
// Message is an i18n key (namespace:key), resolved to the request's language
// by validate.middleware.js — same pattern as auth.citizen.routes.js.
const statusSchema = z.object({ status: z.enum(['pending','in_progress','resolved','rejected'], { message: 'validation:invalid_status' }) });
const r=Router(); r.use(verifyAuth,requireRole('admin')); r.get('/grievances',c.all); r.patch('/grievances/:id/status',validate(statusSchema),c.updateStatus); export default r;
