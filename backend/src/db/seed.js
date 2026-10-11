import { getDb, closeDb } from '../config/db.js';
import { ensureIndexes } from './indexes.js';
import { createUser, findUserByEmail } from '../models/user.model.js';
import { hashPassword } from '../utils/hash.util.js';
try {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters).');
  await ensureIndexes(await getDb());
  const existing = await findUserByEmail(email);
  if (existing && existing.role !== 'admin') throw new Error('This email already belongs to a citizen. Choose another admin email.');
  if (!existing) await createUser({ name: process.env.ADMIN_NAME || 'City Admin', email,
    passwordHash: await hashPassword(password), role: 'admin' });
  console.log(existing ? 'Admin already exists; password unchanged.' : 'Admin created.');
} catch (error) {
  console.error('Admin setup failed:', error.message);
  process.exitCode = 1;
} finally {
  await closeDb();
}
