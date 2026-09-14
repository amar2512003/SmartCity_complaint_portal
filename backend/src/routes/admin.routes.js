import { Router } from 'express'; import { z } from 'zod'; import { verifyAuth } from '../middleware/auth.middleware.js'; import { requireRole } from '../middleware/role.middleware.js'; import { validate } from '../middleware/validate.middleware.js'; import * as c from '../controllers/admin.controller.js';
// Message is an i18n key (namespace:key), resolved to the request's language
// by validate.middleware.js — same pattern as auth.citizen.routes.js.
// 'resolved' is intentionally excluded here — it can only be set via the
// dedicated /resolve route below, which requires a location-verified photo.
const statusSchema = z.object({ status: z.enum(['pending','in_progress','rejected'], { message: 'validation:invalid_status' }) });
const resolveSchema = z.object({
  photo: z.string().min(1, { message: 'validation:resolution_photo_required' }),
  latitude: z.number({ message: 'validation:resolution_location_required' }),
  longitude: z.number({ message: 'validation:resolution_location_required' }),
  locationAccuracy: z.number().optional(),
  locationAddress: z.string().optional(),
});
const r=Router(); r.use(verifyAuth,requireRole('admin')); r.get('/grievances',c.all); r.patch('/grievances/:id/status',validate(statusSchema),c.updateStatus); r.patch('/grievances/:id/resolve',validate(resolveSchema),c.resolve); export default r;
