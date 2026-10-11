# Samadhan

React + Express + MongoDB smart-city grievance portal. Frontend and backend can remain on Vercel; MongoDB Atlas hosts the database.

See [MongoDB setup and Vercel cutover](docs/mongodb-setup.md) for the complete deployment steps and existing-data considerations.

## Local setup

Use Node.js 22. Copy `backend/.env.example` to `backend/.env` and fill in MongoDB, JWT, SMTP, and your chosen admin credentials. Do not commit `.env`.

```bash
cd backend
npm ci
npm run db:setup
npm run seed
npm run dev
```

`db:setup` creates MongoDB indexes, including unique user emails and expiry cleanup for OTPs. `npm run migrate` is an alias for this setup; it does not copy Supabase data. `seed` creates your admin once and never resets an existing password.

In another terminal, copy `Frontend/.env.example` to `Frontend/.env`, then:

```bash
cd Frontend
npm ci
npm run dev
```

Frontend: http://localhost:5173. Backend with the example configuration: http://localhost:5001.

Citizen signup and login use emailed OTPs. For Gmail SMTP, use an App Password in `SMTP_PASS`, with `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_SECURE=false`, and `SMTP_USER` set to your email.

## Verification

```bash
cd backend
npm test
```

Tests start an isolated temporary MongoDB process (the first run downloads a MongoDB binary); they never use your Atlas database. They exercise unique IDs/emails, OTP signup/login/expiry/attempts, admin login, citizen isolation, complaint listing, status updates, and location-checked resolution.
