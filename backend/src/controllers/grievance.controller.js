import { createGrievance,getCitizenGrievances } from '../models/grievance.model.js';
import { ok,fail } from '../utils/apiResponse.util.js';
export async function create(req,res){try{const g=await createGrievance({citizenId:req.user.id,...req.body});return ok(res,g,'Grievance submitted');}catch(e){return fail(res,e.message,500)}}
export async function mine(req,res){try{return ok(res,await getCitizenGrievances(req.user.id));}catch(e){return fail(res,e.message,500)}}
