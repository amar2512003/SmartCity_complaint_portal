export async function ensureIndexes(db) {
  await db.collection('users').createIndexes([
    { key: { id: 1 }, unique: true }, { key: { email: 1 }, unique: true },
  ]);
  await db.collection('grievances').createIndexes([
    { key: { id: 1 }, unique: true }, { key: { citizen_id: 1, created_at: -1, id: -1 } },
    { key: { created_at: -1, id: -1 } },
  ]);
  await db.collection('email_otps').createIndexes([
    { key: { id: 1 }, unique: true }, { key: { email: 1, purpose: 1, id: -1 } },
    { key: { expires_at: 1 }, expireAfterSeconds: 0 },
  ]);
}
