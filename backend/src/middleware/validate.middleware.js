import { fail } from '../utils/apiResponse.util.js';
export const validate=(schema)=>(req,res,next)=>{const result=schema.safeParse(req.body);if(!result.success)return fail(res,result.error.issues[0]?.message||'Invalid request',422);req.body=result.data;next();};
