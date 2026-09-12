import { getAllGrievances,updateGrievanceStatus } from '../models/grievance.model.js';
import { ok,fail } from '../utils/apiResponse.util.js';
import { t } from '../i18n/index.js';
export async function all(req,res){try{return ok(res,await getAllGrievances());}catch(e){console.error('getAllGrievances:',e);return fail(res,t('grievance:fetch_all_failed',req.lang),500)}}
export async function updateStatus(req,res){try{const g=await updateGrievanceStatus(req.params.id,req.body.status);if(!g)return fail(res,t('grievance:not_found',req.lang),404);return ok(res,g,t('grievance:status_updated',req.lang));}catch(e){console.error('updateGrievanceStatus:',e);return fail(res,t('grievance:update_status_failed',req.lang),500)}}
