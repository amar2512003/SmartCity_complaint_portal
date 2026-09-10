import { fail } from '../utils/apiResponse.util.js';
export const requireRole=(role)=>(req,res,next)=>req.user?.role===role?next():fail(res,'Forbidden',403);
