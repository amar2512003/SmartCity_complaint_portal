import { getDb, closeDb } from '../config/db.js';
import { ensureIndexes } from './indexes.js';
try {
  await ensureIndexes(await getDb());
  console.log('MongoDB collections and indexes are ready.');
} catch (error) {
  console.error('Database setup failed:', error.message);
  process.exitCode = 1;
} finally {
  await closeDb();
}
