import { verifyToken } from '../utils/jwt.util.js';
import { fail } from '../utils/apiResponse.util.js';
import { t } from '../i18n/index.js';
export function verifyAuth(req,res,next){try{const h=req.headers.authorization;if(!h?.startsWith('Bearer ')) return fail(res,t('auth:authentication_required',req.lang),401);req.user=verifyToken(h.slice(7));next();}catch{return fail(res,t('auth:invalid_or_expired_token',req.lang),401)}}
