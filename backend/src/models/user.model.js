import { getDb, nextId, numericId, withoutMongoId } from '../config/db.js';

const publicFields = { _id: 0, id: 1, name: 1, email: 1, role: 1, preferred_language: 1 };
export const findUserByEmail = async (email) => (await getDb()).collection('users').findOne({ email }, withoutMongoId);
export const findUserById = async (id) => (await getDb()).collection('users').findOne({ id: numericId(id) }, withoutMongoId);
export async function createUser({ name, email, passwordHash, role = 'citizen' }) {
  const db = await getDb();
  const now = new Date();
  const user = { id: await nextId('users'), name, email, password_hash: passwordHash ?? null, role,
    preferred_language: 'en', created_at: now, updated_at: now };
  await db.collection('users').insertOne(user);
  return { id: user.id, name, email, role, preferred_language: 'en' };
}
export const updatePreferredLanguage = async (id, language) => (await getDb()).collection('users').findOneAndUpdate(
  { id: numericId(id) }, { $set: { preferred_language: language, updated_at: new Date() } },
  { projection: publicFields, returnDocument: 'after', includeResultMetadata: false },
);
