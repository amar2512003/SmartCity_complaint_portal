import { db } from '../config/db.js';
export const createGrievance=async({citizenId,title,description,category,photo,latitude,longitude,locationAccuracy,locationAddress,municipalBody,municipalDistrict})=>{const [g]=await db('grievances').insert({citizen_id:citizenId,title,description,category,photo:photo||null,latitude:latitude??null,longitude:longitude??null,location_accuracy:locationAccuracy??null,location_address:locationAddress||null,municipal_body:municipalBody||null,municipal_district:municipalDistrict||null,status:'pending'}).returning('*');return g;};
export const getCitizenGrievances=(citizenId)=>db('grievances').where({citizen_id:citizenId}).orderBy('created_at','desc');
export const getAllGrievances=()=>db('grievances').join('users','users.id','grievances.citizen_id').select('grievances.*','users.name as citizen_name','users.email as citizen_email').orderBy('grievances.created_at','desc');
export const updateGrievanceStatus=async(id,status)=>{const [g]=await db('grievances').where({id}).update({status,updated_at:db.fn.now()}).returning('*');return g;};
export const getGrievanceById=(id)=>db('grievances').where({id}).first();
export const resolveGrievance=async(id,{adminId,photo,latitude,longitude,locationAccuracy,locationAddress,distanceMeters})=>{
  const [g]=await db('grievances').where({id}).update({
    status:'resolved',
    resolution_photo:photo,
    resolution_latitude:latitude,
    resolution_longitude:longitude,
    resolution_accuracy:locationAccuracy??null,
    resolution_address:locationAddress||null,
    resolution_distance_meters:distanceMeters,
    resolved_at:db.fn.now(),
    resolved_by_admin_id:adminId,
    updated_at:db.fn.now(),
  }).returning('*');
  return g;
};
