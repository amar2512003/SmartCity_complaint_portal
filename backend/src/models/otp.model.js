import { getDb, nextId, numericId, withoutMongoId } from '../config/db.js';

export const deletePendingSignup = async (email, purpose = 'signup') =>
  (await getDb()).collection('email_otps').deleteMany({ email, purpose });
export async function createPendingSignup({ email, name, passwordHash, otpHash, expiresAt, purpose = 'signup' }) {
  const db = await getDb();
  const now = new Date();
  return db.collection('email_otps').insertOne({ id: await nextId('email_otps'), email, name,
    password_hash: passwordHash ?? null, otp_hash: otpHash, purpose,
    expires_at: new Date(expiresAt), attempts: 0, created_at: now, updated_at: now });
}
export const findPendingSignup = async (email, purpose = 'signup') =>
  (await getDb()).collection('email_otps').findOne({ email, purpose }, { ...withoutMongoId, sort: { id: -1 } });
export const incrementAttempts = async (id) => (await getDb()).collection('email_otps').updateOne(
  { id: numericId(id) }, { $inc: { attempts: 1 }, $set: { updated_at: new Date() } });
export const deleteOtp = async (id) => (await getDb()).collection('email_otps').deleteOne({ id: numericId(id) });
