# Switch from Supabase Postgres to MongoDB Atlas

The repository now uses the official MongoDB Node.js driver. Changing only the old `DATABASE_URL` would not have worked: PostgreSQL queries have been replaced across users, admins, email OTPs, and grievances. Existing API fields, numeric IDs, timestamps, and photo data remain compatible with the frontend.

## 1. Create your Atlas database

1. Sign in at https://www.mongodb.com/cloud/atlas/register and create a project, for example `SmartCity`.
2. Create a cluster and explicitly select **Free** (formerly M0) if you want the free tier. Choose an available region near your Vercel backend region.
3. Under **Database Access**, create a password-authenticated database user, for example `smartcity_app`. This is separate from your Atlas website login. Give it `readWrite` access to the `smart_city` database and save a strong password.
4. Under **Network Access**, add your current public IP for local setup. Vercel functions normally use changing outbound IPs. Without static egress, the simple Atlas option is `0.0.0.0/0`; this allows network connections from anywhere, so keep the database password strong and secret and restrict the user's database permissions. If you have static egress configured, allowlist those addresses instead. Adding your Vercel domain is not an IP allowlist entry.
5. Open the cluster's **Connect → Drivers → Node.js** and copy the connection string. Replace the username/password placeholders and URL-encode special characters in credentials. Do not copy the old Postgres URI or its Supabase pooler query parameters.
6. Use `MONGODB_DB=smart_city`. You do not need to manually create tables or collections: the setup command below creates the indexed collections; writes create data and counters.

Example (placeholders only):

```dotenv
MONGODB_URI=mongodb+srv://smartcity_app:URL_ENCODED_PASSWORD@YOUR_CLUSTER.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=smart_city
```

The explicit `MONGODB_DB` selects the database, regardless of a database path in the URI.

## 2. Initialize the database from your computer

Use Node.js 22 and copy `backend/.env.example` to `backend/.env`. Fill in the Atlas values, `JWT_SECRET`, and your own `ADMIN_EMAIL`, `ADMIN_PASSWORD` (12 or more characters), and optional `ADMIN_NAME`.

```bash
cd backend
npm ci
npm run db:setup
npm run seed
```

Run setup before sending application traffic. It creates unique indexes for public IDs and user email, complaint listing indexes, and an OTP TTL index. OTP expiry is also checked by the API because TTL deletion is asynchronous. Keep these indexes in place.

The seed command creates an admin only if the email is unused. It refuses to promote an existing citizen and does not change an existing admin password. Admin seed variables are needed only on the computer where you run this command, not on Vercel. The frontend no longer advertises or pre-fills the old demo password.

## 3. Update the backend Vercel project

In **smartcity-backend → Settings → Environment Variables**:

| Variable | Action |
| --- | --- |
| `MONGODB_URI` | Add the Atlas URI as a secret, on the backend only. |
| `MONGODB_DB` | Add `smart_city`. |
| `DATABASE_URL` | Remove the obsolete Supabase value for the MongoDB deployment. |
| `MIGRATION_DATABASE_URL` | Remove if present; no longer used. |
| `JWT_SECRET` | Keep a strong secret. When starting with an empty database, replace it with a new random secret to invalidate old sessions whose numeric IDs could otherwise refer to new users. |
| `SMTP_*` | Keep existing values so citizen OTP emails continue working. |
| `FRONTEND_URL` / `FRONTEND_URLS` | Keep your frontend origin(s). |
| `GROQ_API_KEY`, `GROQ_MODEL`, `RESOLUTION_DISTANCE_THRESHOLD_METERS` | Keep existing values if used. |

Apply variables to Production and any Preview/Development environments you use. Prefer a separate database and credentials for previews. Generate a fresh JWT secret locally with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` and store the output privately.

After setup succeeds, commit/push the updated repository through your normal deployment flow and deploy the new backend code. Environment variable edits require a new deployment. Do not point the old Postgres code at MongoDB. Coordinate the cutover if the live app is receiving writes.

Keep the Vercel backend root directory set to `backend`; its existing `api/index.js` entry point and `vercel.json` work with MongoDB. Connections are opened lazily, reused per warm instance, and limited to a pool of five per instance. Neither seeding nor index creation runs inside requests or during deployment builds.

## 4. Frontend and smoke test

Keep frontend `VITE_API_URL=https://YOUR-BACKEND.vercel.app/api`. Never put MongoDB credentials in a `VITE_*` variable. Redeploy the frontend to remove the old demo admin credentials; the database switch itself requires no API URL or response-format change.

Verify:

1. Open `/api/health` on the backend. This confirms the API is running, **not** database connectivity.
2. Log in as your seeded admin. This exercises the database and password check.
3. Sign up as a citizen and verify the emailed OTP; sign out and verify OTP login.
4. Submit a complaint with a photo/location, then check it in the citizen and admin dashboards.
5. Update its status and resolve it with a photo at the reported location.
6. Change the preferred language and confirm it persists after login.

If Atlas cannot connect, check the database user's credentials, encoded password, IP access list, exact cluster hostname, and Vercel environment scope. Check backend deployment logs for details.

## Existing Supabase data

**These code changes do not transfer existing records. A new Atlas database starts empty.** If you start fresh, old users must sign up again and old complaints remain only in Supabase. Rotate `JWT_SECRET` at cutover as described above.

If you need to retain records, take a Supabase export/backup before switching and perform a separate data migration during a write freeze:

- Export `users` and `grievances`, preserving user IDs, grievance IDs, `citizen_id`, `resolved_by_admin_id`, email, password hashes, language, photo fields, and timestamps. Expired/pending OTPs can be discarded; users request new ones.
- Transform SQL rows to MongoDB documents. IDs and foreign keys must be numbers; timestamps must be BSON dates; coordinates, accuracies, and distances must be numbers or null. Preserve SQL nulls as null and fill any missing newer fields with their defaults.
- Import users before complaints into an empty target database, check unique IDs/emails and valid user references, then set the `counters` collection documents `{ _id: 'users', value: MAX_USER_ID }` and `{ _id: 'grievances', value: MAX_GRIEVANCE_ID }`. Numeric ID allocation depends on these counters; do this before seeding or allowing new writes. An omitted counter starts at 1.
- Run `npm run db:setup`, compare row/document counts and sample records, verify admin login and complaint ownership, then deploy. Keep the original export and Supabase database until the new application is verified. A SQL dump cannot be directly imported using `mongoimport`; it needs conversion.

No live Supabase/Atlas connection or data migration has been performed by this code change. If Supabase access is currently blocked by quota, restore export access or use an existing backup before migrating old records.

## Free-tier capacity

Atlas Free currently has a 512 MB storage limit. This app stores base64 photos inside complaint documents, so MongoDB's free tier can also fill up. For sustained usage, move photos to object storage and keep only their URLs in MongoDB; that is a separate change.

## Official references

- Atlas connections and access: https://www.mongodb.com/docs/atlas/connect-to-database-deployment/
- Atlas/Vercel network access: https://www.mongodb.com/docs/atlas/reference/partner-integrations/vercel/
- Atlas storage limits: https://www.mongodb.com/docs/atlas/reference/faq/storage/
- Vercel environment variables: https://vercel.com/docs/environment-variables
