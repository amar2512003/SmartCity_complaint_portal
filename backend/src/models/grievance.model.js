import { routeMunicipality } from '../utils/municipalRouting.js';
import { getDb, nextId, numericId, withoutMongoId, updatedDocument } from '../config/db.js';

export async function createGrievance({ citizenId, title, description, category, photo, latitude, longitude,
  locationAccuracy, locationAddress, locationSource, capturedLatitude, capturedLongitude }) {
  const db = await getDb();
  const citizen = await db.collection('users').findOne({ id: numericId(citizenId), role: 'citizen' });
  if (!citizen) throw new Error('Citizen account not found');
  const routing = routeMunicipality(latitude, longitude, locationAccuracy);
  const now = new Date();
  const grievance = { id: await nextId('grievances'), citizen_id: citizen.id, title, description, category,
    photo: photo || null, latitude: latitude ?? null, longitude: longitude ?? null,
    location_accuracy: locationAccuracy ?? null, location_address: locationAddress || null,
    municipal_body: routing.municipalBody, municipal_district: routing.district,
    routing_status: routing.confidence, routing_reason: routing.reason, routing_source: routing.source,
    location_source: locationSource || 'device', captured_latitude: capturedLatitude === undefined ? latitude ?? null : capturedLatitude,
    captured_longitude: capturedLongitude === undefined ? longitude ?? null : capturedLongitude, status: 'pending',
    resolution_photo: null, resolution_latitude: null, resolution_longitude: null, resolution_accuracy: null,
    resolution_address: null, resolution_distance_meters: null, resolved_at: null, resolved_by_admin_id: null,
    created_at: now, updated_at: now };
  await db.collection('grievances').insertOne(grievance);
  const { _id, ...result } = grievance;
  return result;
}
export const getCitizenGrievances = async (citizenId) => (await getDb()).collection('grievances')
  .find({ citizen_id: numericId(citizenId) }, withoutMongoId).sort({ created_at: -1, id: -1 }).toArray();
export const getAllGrievances = async () => (await getDb()).collection('grievances').aggregate([
  { $sort: { created_at: -1, id: -1 } },
  { $lookup: { from: 'users', localField: 'citizen_id', foreignField: 'id', as: 'citizen' } },
  { $unwind: '$citizen' },
  { $set: { citizen_name: '$citizen.name', citizen_email: '$citizen.email' } },
  { $project: { _id: 0, citizen: 0 } },
]).toArray();
export const updateGrievanceStatus = async (id, status) => (await getDb()).collection('grievances').findOneAndUpdate(
  { id: numericId(id) }, { $set: { status, updated_at: new Date() } }, updatedDocument);
export const getGrievanceById = async (id) => (await getDb()).collection('grievances').findOne({ id: numericId(id) }, withoutMongoId);
export async function resolveGrievance(id, { adminId, photo, latitude, longitude, locationAccuracy, locationAddress, distanceMeters }) {
  const db = await getDb();
  if (!await db.collection('users').findOne({ id: numericId(adminId), role: 'admin' })) throw new Error('Admin account not found');
  const now = new Date();
  return db.collection('grievances').findOneAndUpdate({ id: numericId(id) }, { $set: {
    status: 'resolved', resolution_photo: photo, resolution_latitude: latitude, resolution_longitude: longitude,
    resolution_accuracy: locationAccuracy ?? null, resolution_address: locationAddress || null,
    resolution_distance_meters: distanceMeters, resolved_at: now, resolved_by_admin_id: numericId(adminId), updated_at: now,
  } }, updatedDocument);
}
