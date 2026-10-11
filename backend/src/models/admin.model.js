import { getDb, withoutMongoId } from '../config/db.js';
export const findAdminByEmail = async (email) => (await getDb()).collection('users').findOne({ email, role: 'admin' }, withoutMongoId);
