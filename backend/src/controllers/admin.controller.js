import { getAllGrievances,updateGrievanceStatus } from '../models/grievance.model.js';
import { ok,fail } from '../utils/apiResponse.util.js';
export async function all(req,res){try{return ok(res,await getAllGrievances());}catch(e){return fail(res,e.message,500)}}
export async function updateStatus(req,res){try{const allowed=['pending','in_progress','resolved','rejected'];if(!allowed.includes(req.body.status))return fail(res,'Invalid status',422);const g=await updateGrievanceStatus(req.params.id,req.body.status);if(!g)return fail(res,'Grievance not found',404);return ok(res,g,'Status updated');}catch(e){return fail(res,e.message,500)}}
