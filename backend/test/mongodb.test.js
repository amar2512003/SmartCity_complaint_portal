import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { MongoMemoryServer } from 'mongodb-memory-server';
let mongo, db, closeDb, users, grievances, otps, admin, server, base, hashPassword, signToken;
before(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  process.env.MONGODB_DB = 'smart_city_test';
  process.env.JWT_SECRET = 'test-secret-for-isolated-integration-tests';
  const config = await import('../src/config/db.js');
  closeDb = config.closeDb;
  db = await config.getDb();
  assert.equal(db, await config.getDb());
  const { ensureIndexes } = await import('../src/db/indexes.js');
  await ensureIndexes(db);
  await ensureIndexes(db);
  users = await import('../src/models/user.model.js');
  grievances = await import('../src/models/grievance.model.js');
  otps = await import('../src/models/otp.model.js');
  ({ hashPassword } = await import('../src/utils/hash.util.js'));
  ({ signToken } = await import('../src/utils/jwt.util.js'));
  admin = await users.createUser({ name: 'Admin', email: 'admin@test.local', passwordHash: await hashPassword('test-admin-password'), role: 'admin' });
  const { default: app } = await import('../src/app.js');
  await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve); });
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  if (closeDb) await closeDb();
  if (mongo) await mongo.stop();
});
const request = async (path, { method = 'GET', body, token } = {}) => {
  const res = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return { status: res.status, body: await res.json() };
};
test('numeric IDs stay unique under concurrent writes; emails are unique and public fields omit hashes', async () => {
  const records = await Promise.all(Array.from({ length: 15 }, (_, i) => users.createUser({ name: `Citizen ${i}`, email: `citizen${i}@test.local` })));
  assert.equal(new Set(records.map(u => u.id)).size, 15);
  assert.ok(records.every(u => Number.isInteger(u.id) && !('_id' in u) && !('password_hash' in u)));
  await assert.rejects(users.createUser({ name: 'Duplicate', email: records[0].email }), { code: 11000 });
  assert.equal((await users.findUserById(String(records[0].id))).email, records[0].email);
  assert.equal((await users.updatePreferredLanguage(records[0].id, 'bn')).preferred_language, 'bn');
});
test('OTP signup/login, expiry and attempt limit work with MongoDB records', async () => {
  const email = 'otp@test.local';
  const otpHash = await hashPassword('123456');
  const pending = async (purpose, expiresAt = new Date(Date.now() + 600000)) => {
    await otps.deletePendingSignup(email, purpose);
    await otps.createPendingSignup({ email, name: 'OTP Citizen', otpHash, expiresAt, purpose });
  };
  await pending('signup');
  const signup = await request('/auth/citizen/signup/verify-otp', { method: 'POST', body: { email, otp: '123456' } });
  assert.equal(signup.status, 200, JSON.stringify(signup.body));
  assert.ok(signup.body.data.token);
  assert.equal(await otps.findPendingSignup(email), null);
  await pending('login');
  const login = await request('/auth/citizen/login/verify-otp', { method: 'POST', body: { email, otp: '123456' } });
  assert.equal(login.status, 200);
  await pending('login', new Date(Date.now() - 1000));
  assert.equal((await request('/auth/citizen/login/verify-otp', { method: 'POST', body: { email, otp: '123456' } })).status, 400);
  await pending('login');
  const record = await otps.findPendingSignup(email, 'login');
  await Promise.all(Array.from({ length: 5 }, () => otps.incrementAttempts(record.id)));
  assert.equal((await request('/auth/citizen/login/verify-otp', { method: 'POST', body: { email, otp: '123456' } })).status, 429);
  const indexes = await db.collection('email_otps').indexes();
  assert.ok(indexes.some(i => i.expireAfterSeconds === 0 && i.key.expires_at === 1));
});
test('admin login, complaint ownership, join, status and location-checked resolution retain API behavior', async () => {
  const citizen = await users.createUser({ name: 'Reporter', email: 'reporter@test.local' });
  const token = signToken(citizen);
  const adminLogin = await request('/auth/admin/login', { method: 'POST', body: { email: admin.email, password: 'test-admin-password' } });
  assert.equal(adminLogin.status, 200);
  const adminToken = adminLogin.body.data.token;
  const created = await request('/grievances', { method: 'POST', token, body: { title: 'Broken road', description: 'Road needs repairs', category: 'Roads', photo: 'data:image/jpeg;base64,before', latitude: 22.57, longitude: 88.36 } });
  assert.equal(created.status, 200, JSON.stringify(created.body));
  const g = created.body.data;
  assert.equal(g.citizen_id, citizen.id);
  assert.ok(!('_id' in g));
  assert.equal((await request('/grievances', { token })).body.data.length, 1);
  assert.equal((await request('/grievances', { token: signToken({ id: 99999, role: 'citizen' }) })).body.data.length, 0);
  const all = await request('/admin/grievances', { token: adminToken });
  assert.equal(all.body.data[0].citizen_email, citizen.email);
  assert.ok(!('citizen' in all.body.data[0]));
  assert.equal((await request('/admin/grievances', { token })).status, 403);
  const path = `/admin/grievances/${g.id}`;
  assert.equal((await request(path + '/status', { method: 'PATCH', token: adminToken, body: { status: 'in_progress' } })).body.data.status, 'in_progress');
  assert.equal((await request('/admin/grievances/invalid/status', { method: 'PATCH', token: adminToken, body: { status: 'pending' } })).status, 404);
  const resolution = { photo: 'data:image/jpeg;base64,after', latitude: 23, longitude: 89 };
  assert.equal((await request(path + '/resolve', { method: 'PATCH', token: adminToken, body: resolution })).status, 422);
  const resolved = await request(path + '/resolve', { method: 'PATCH', token: adminToken, body: { ...resolution, latitude: 22.57, longitude: 88.36 } });
  assert.equal(resolved.body.data.status, 'resolved');
  assert.equal(resolved.body.data.resolved_by_admin_id, admin.id);
  assert.equal(resolved.body.data.resolution_distance_meters, 0);
  assert.equal((await grievances.getGrievanceById(String(g.id))).resolution_photo, resolution.photo);
  await assert.rejects(grievances.createGrievance({ citizenId: 99999, title: 'Orphan' }), /Citizen account not found/);
});

test('setup and admin seed scripts are repeatable and preserve existing credentials', async () => {
  const run = promisify(execFile);
  const cwd = fileURLToPath(new URL('..', import.meta.url));
  const env = { ...process.env, ADMIN_EMAIL: 'seed@test.local', ADMIN_PASSWORD: 'seed-test-password' };
  await run(process.execPath, ['src/db/setup.js'], { cwd, env });
  await run(process.execPath, ['src/db/seed.js'], { cwd, env });
  const first = await users.findUserByEmail(env.ADMIN_EMAIL);
  assert.equal(first.role, 'admin');
  await run(process.execPath, ['src/db/seed.js'], { cwd, env: { ...env, ADMIN_PASSWORD: 'different-seed-password' } });
  assert.equal((await users.findUserByEmail(env.ADMIN_EMAIL)).password_hash, first.password_hash);
  await assert.rejects(run(process.execPath, ['src/db/seed.js'], { cwd, env: { ...env, ADMIN_EMAIL: 'citizen0@test.local' } }));
});

test('routing API validates coordinates and complaint creation overrides forged municipality labels', async () => {
  const citizen = await users.createUser({ name: 'Location test', email: 'location@test.local' });
  const token = signToken(citizen);
  const body = { latitude: 22.657, longitude: 88.365, locationAccuracy: 5 };
  assert.equal((await request('/location/route', { method: 'POST', body })).status, 401);
  assert.equal((await request('/location/route', { method: 'POST', token, body: { ...body, latitude: 999 } })).status, 422);
  assert.equal((await request('/location/route', { method: 'POST', token, body })).body.data.municipalBody, 'Kamarhati Municipality');
  const result = await request('/grievances', { method: 'POST', token, body: {
    ...body, title: 'Routing test', description: 'Boundary based routing', category: 'Road', photo: 'data:image/jpeg;base64,test',
    municipalBody: 'Bally Municipality', municipalDistrict: 'Howrah', locationSource: 'manual',
    capturedLatitude: 22.65306, capturedLongitude: 88.34413,
  } });
  assert.equal(result.status, 200);
  assert.equal(result.body.data.municipal_body, 'Kamarhati Municipality');
  assert.equal(result.body.data.municipal_district, 'North 24 Parganas');
  assert.equal(result.body.data.routing_status, 'boundary');
  assert.equal(result.body.data.location_source, 'manual');
  assert.equal(result.body.data.captured_longitude, 88.34413);
});
