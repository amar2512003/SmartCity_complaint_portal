import { MongoClient } from 'mongodb';
import { env } from './env.js';

// Reuse one small pool and in-flight connection across warm Vercel requests.
let client;
let connection;
export function getDb() {
  if (!connection) {
    client = new MongoClient(env.mongodbUri, {
      maxPoolSize: 5, minPoolSize: 0, maxIdleTimeMS: 60000,
      serverSelectionTimeoutMS: 10000,
    });
    connection = client.connect().then(() => client.db(env.mongodbDb)).catch(async (error) => {
      await client.close();
      connection = undefined;
      throw error;
    });
  }
  return connection;
}
export async function closeDb() {
  if (client) await client.close();
  connection = undefined;
  client = undefined;
}

// Keep numeric public IDs and foreign keys compatible with the existing API.
export async function nextId(collection) {
  const db = await getDb();
  const counter = await db.collection('counters').findOneAndUpdate(
    { _id: collection }, { $inc: { value: 1 } },
    { upsert: true, returnDocument: 'after', includeResultMetadata: false },
  );
  return counter.value;
}
export const withoutMongoId = { projection: { _id: 0 } };
export const updatedDocument = { ...withoutMongoId, returnDocument: 'after', includeResultMetadata: false };
export function numericId(id) {
  return /^\d+$/.test(String(id)) && Number.isSafeInteger(Number(id)) && Number(id) > 0 ? Number(id) : -1;
}
