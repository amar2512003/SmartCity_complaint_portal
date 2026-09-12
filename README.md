# Samadhan

Simple React + Express + PostgreSQL smart-city grievance portal.

## Email OTP signup

Citizen signup now uses email verification:

1. Enter name, email and password.
2. Click **Verify email**.
3. Backend generates a 6-digit OTP and emails it.
4. Enter the OTP in the frontend.
5. Only after successful verification is the citizen account created.

### Gmail setup (easy local-development option)

Use a Gmail account and a Google **App Password**. Do not put your normal Gmail password in `.env`.

In `backend/.env` set:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=yourgmail@gmail.com
SMTP_PASS=your_16_character_app_password
```

Then install the new backend dependency:

```bash
cd backend
npm install
npm run migrate
npm run dev
```

The new migration creates the `email_otps` table.

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Ports

Frontend: `http://localhost:5173`
Backend: `http://localhost:5001`
PostgreSQL: `localhost:5432`
Database: `smart_city`
