import { getAllGrievances,updateGrievanceStatus,getGrievanceById,resolveGrievance } from '../models/grievance.model.js';
import { ok,fail } from '../utils/apiResponse.util.js';
import { t } from '../i18n/index.js';
import { distanceMeters } from '../utils/distance.util.js';
import { env } from '../config/env.js';

export async function all(req,res){try{return ok(res,await getAllGrievances());}catch(e){console.error('getAllGrievances:',e);return fail(res,t('grievance:fetch_all_failed',req.lang),500)}}

export async function updateStatus(req,res){try{const g=await updateGrievanceStatus(req.params.id,req.body.status);if(!g)return fail(res,t('grievance:not_found',req.lang),404);return ok(res,g,t('grievance:status_updated',req.lang));}catch(e){console.error('updateGrievanceStatus:',e);return fail(res,t('grievance:update_status_failed',req.lang),500)}}

// Resolving a grievance requires the admin to submit a geo-tagged photo taken
// at (or near) the location the citizen originally reported. This is kept
// separate from the generic updateStatus handler so "resolved" can never be
// set without passing the location check below.
export async function resolve(req,res){
  try{
    const grievance=await getGrievanceById(req.params.id);
    if(!grievance) return fail(res,t('grievance:not_found',req.lang),404);

    if(grievance.latitude==null || grievance.longitude==null){
      return fail(res,t('grievance:missing_original_location',req.lang),422);
    }

    const {photo,latitude,longitude,locationAccuracy,locationAddress}=req.body;
    const distance=distanceMeters(Number(grievance.latitude),Number(grievance.longitude),latitude,longitude);
    const threshold=env.resolutionDistanceThresholdMeters;

    if(distance>threshold){
      const message=t('grievance:location_mismatch',req.lang,{distance:Math.round(distance),threshold});
      return fail(res,message,422,{distanceMeters:Math.round(distance),thresholdMeters:threshold});
    }

    const g=await resolveGrievance(req.params.id,{
      adminId:req.user.id,
      photo,
      latitude,
      longitude,
      locationAccuracy,
      locationAddress,
      distanceMeters:distance,
    });
    return ok(res,g,t('grievance:resolve_success',req.lang));
  }catch(e){
    console.error('resolveGrievance:',e);
    return fail(res,t('grievance:update_status_failed',req.lang),500);
  }
}
