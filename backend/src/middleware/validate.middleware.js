import { fail } from '../utils/apiResponse.util.js';
import { t } from '../i18n/index.js';
// Zod schemas may set their custom `message` to either a plain English
// string (older/not-yet-translated schemas) or a `namespace:key` i18n key
// (schemas translated starting Sprint 3, e.g. citizen auth). `t()` just
// returns the string unchanged when it isn't a resolvable key, so both
// styles pass through safely — schemas get translated incrementally.
export const validate=(schema)=>(req,res,next)=>{
  const result=schema.safeParse(req.body);
  if(!result.success){
    const rawMessage=result.error.issues[0]?.message||'validation:invalid_request';
    return fail(res,t(rawMessage,req.lang),422);
  }
  req.body=result.data;
  next();
};
