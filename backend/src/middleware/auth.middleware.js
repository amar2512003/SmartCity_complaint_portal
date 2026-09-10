import { verifyToken } from '../utils/jwt.util.js';
import { fail } from '../utils/apiResponse.util.js';
export function verifyAuth(req,res,next){try{const h=req.headers.authorization;if(!h?.startsWith('Bearer ')) return fail(res,'Authentication required',401);req.user=verifyToken(h.slice(7));next();}catch{return fail(res,'Invalid or expired token',401)}}
