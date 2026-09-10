import { Router } from 'express';
import { verifyAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import * as c from '../controllers/assistant.controller.js';

const r = Router();
r.use(verifyAuth, requireRole('citizen'));
r.post('/chat', c.chat);
export default r;
