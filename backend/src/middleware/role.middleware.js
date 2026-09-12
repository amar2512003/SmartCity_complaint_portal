import { fail } from '../utils/apiResponse.util.js';
import { t } from '../i18n/index.js';
export const requireRole=(role)=>(req,res,next)=>req.user?.role===role?next():fail(res,t('auth:forbidden',req.lang),403);
