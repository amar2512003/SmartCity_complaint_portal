import { findAdminByEmail } from '../models/admin.model.js';
import { comparePassword } from '../utils/hash.util.js';
import { signToken } from '../utils/jwt.util.js';
import { ok,fail } from '../utils/apiResponse.util.js';
import { t } from '../i18n/index.js';
export async function loginAdmin(req,res){try{const user=await findAdminByEmail(req.body.email);if(!user||!(await comparePassword(req.body.password,user.password_hash)))return fail(res,t('auth:admin_invalid_credentials',req.lang),401);const token=signToken({id:user.id,name:user.name,email:user.email,role:'admin'});return ok(res,{user:{id:user.id,name:user.name,email:user.email,role:'admin'},token},t('auth:admin_login_success',req.lang));}catch(e){return fail(res,e.message,500)}}
