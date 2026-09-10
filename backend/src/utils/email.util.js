import nodemailer from 'nodemailer';

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

export async function sendOtpEmail({ to, otp }) {
  const transporter = nodemailer.createTransport({
    host: required('SMTP_HOST'),
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: required('SMTP_USER'),
      pass: required('SMTP_PASS')
    }
  });

  await transporter.sendMail({
    from: `SmartCity Portal <${required('SMTP_USER')}>`,
    to,
    subject: 'Your SmartCity verification code',
    text: `Your SmartCity verification code is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;color:#17202a">
        <div style="font-size:24px;font-weight:700;margin-bottom:20px">SmartCity Portal</div>
        <h2 style="margin-bottom:8px">Verify your email</h2>
        <p style="color:#687483;line-height:1.6">Use the verification code below to finish creating your citizen account.</p>
        <div style="font-size:34px;letter-spacing:10px;font-weight:800;background:#f1f7f4;padding:20px;text-align:center;border-radius:12px;margin:24px 0">${otp}</div>
        <p style="color:#687483;font-size:14px">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `
  });
}
