import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

function required(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Kolkata artwork used in the email
const kolkataImagePath = path.join(
  __dirname,
  "../assets/smartcity-kolkata.png"
);

// Reuse a single transporter across calls instead of recreating one per email.
// Re-authenticating on every send looks bursty to some providers and is just
// slower; a shared, pooled connection is both faster and slightly better
// for reputation.
let transporter;
function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: required("SMTP_HOST"),
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    pool: true,
    auth: {
      user: required("SMTP_USER"),
      pass: required("SMTP_PASS"),
    },
    // If you send through your own domain's mail server (not a provider
    // like SES/SendGrid/Resend that signs for you), you can DKIM-sign here.
    // Requires a private key generated for a DNS selector you've published
    // as a TXT record on your domain. Leave unset if your provider already
    // signs outgoing mail (most transactional providers do this for you).
    // dkim: {
    //   domainName: 'yourdomain.com',
    //   keySelector: 'default',
    //   privateKey: required('DKIM_PRIVATE_KEY'),
    // },
  });
  return transporter;
}

export async function sendOtpEmail({ to, otp }) {
  const fromAddress = required("SMTP_USER");
  // Recommended: SMTP_FROM should be a mailbox on a domain you control with
  // SPF/DKIM/DMARC configured (see notes below). Falls back to SMTP_USER.
  const senderAddress = process.env.SMTP_FROM || fromAddress;
  const messageId = `<${crypto.randomUUID()}@${senderAddress.split("@")[1] || "smartcity-portal"}>`;

  await getTransporter().sendMail({
    from: `SmartCity Portal <${senderAddress}>`,
    to,
    replyTo: senderAddress,
    // Ties the envelope sender to the same domain as the header From —
    // a mismatch here is one of the more common reasons a message that
    // "looks fine" still gets spam-scored.
    envelope: { from: senderAddress, to },
    messageId,
    subject: `${otp} — Your SmartCity verification code`,

    text: `
SmartCity Portal

Your city. Your voice.

Hi there,

You're almost in.

Use the verification code below to continue with your SmartCity account:

${otp}

This code is valid for 10 minutes.

For your security, please do not share this code with anyone.

If you didn't request this verification code, you can safely ignore this email.

SmartCity Portal
Making civic services simpler, one report at a time.
    `,

    attachments: [
      {
        filename: "smartcity-kolkata.png",
        path: kolkataImagePath,
        cid: "smartcity-kolkata",
      },
    ],

    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>SmartCity Verification</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f4f4f4;
    font-family:Arial, Helvetica, sans-serif;
  "
>

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background:#f4f4f4;padding:35px 15px;"
  >

    <tr>
      <td align="center">

        <!-- Main Card -->
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            max-width:600px;
            background:#ffffff;
            border-radius:20px;
            overflow:hidden;
            box-shadow:0 8px 35px rgba(0,0,0,0.10);
          "
        >

          <!-- Orange Header -->
          <tr>
            <td
              style="
                background:#ff6a1a;
                padding:30px 32px 25px;
              "
            >

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >
                <tr>

                  <td
                    style="
                      color:#ffffff;
                      font-size:23px;
                      font-weight:800;
                      letter-spacing:-0.5px;
                    "
                  >
                    SmartCity
                  </td>

                  <td
                    align="right"
                    style="
                      color:#ffffff;
                      font-size:12px;
                      font-weight:700;
                      letter-spacing:1px;
                      text-transform:uppercase;
                    "
                  >
                    Portal
                  </td>

                </tr>
              </table>

              <div
                style="
                  height:1px;
                  background:rgba(255,255,255,0.25);
                  margin:25px 0 20px;
                "
              ></div>

              <div
                style="
                  color:#ffffff;
                  font-size:13px;
                  font-weight:700;
                  letter-spacing:2px;
                  text-transform:uppercase;
                "
              >
                Your city. Your voice.
              </div>

              <div
                style="
                  color:#ffffff;
                  font-size:28px;
                  line-height:1.15;
                  font-weight:800;
                  margin-top:10px;
                "
              >
                Let's make<br />
                Kolkata better.
              </div>

            </td>
          </tr>


          <!-- Kolkata Image -->
          <tr>
            <td style="padding:0;background:#e87512;">

              <img
                src="cid:smartcity-kolkata"
                alt="Kolkata illustration"
                width="600"
                style="
                  display:block;
                  width:100%;
                  max-width:600px;
                  height:auto;
                  border:0;
                "
              />

            </td>
          </tr>


          <!-- Content -->
          <tr>
            <td
              style="
                padding:38px 38px 35px;
                background:#ffffff;
              "
            >

              <div
                style="
                  color:#ff6a1a;
                  font-size:12px;
                  font-weight:800;
                  letter-spacing:1.5px;
                  text-transform:uppercase;
                  margin-bottom:10px;
                "
              >
                Email verification
              </div>

              <h1
                style="
                  margin:0 0 12px;
                  color:#1d1d1d;
                  font-size:30px;
                  line-height:1.2;
                  letter-spacing:-0.8px;
                "
              >
                Verify your email
              </h1>

              <p
                style="
                  margin:0;
                  color:#6f6f6f;
                  font-size:15px;
                  line-height:1.7;
                "
              >
                You're almost there.
                Use the verification code below to continue
                with your SmartCity account.
              </p>


              <!-- OTP Box -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="margin:28px 0;"
              >
                <tr>
                  <td
                    align="center"
                    style="
                      background:#fff4ec;
                      border:1px solid #ffd8c0;
                      border-radius:16px;
                      padding:25px 15px;
                    "
                  >

                    <div
                      style="
                        color:#8b8b8b;
                        font-size:11px;
                        font-weight:700;
                        letter-spacing:2px;
                        text-transform:uppercase;
                        margin-bottom:12px;
                      "
                    >
                      Your verification code
                    </div>

                    <div
                      style="
                        color:#ff5f0a;
                        font-size:38px;
                        line-height:1;
                        font-weight:800;
                        letter-spacing:11px;
                        margin-left:11px;
                      "
                    >
                      ${otp}
                    </div>

                  </td>
                </tr>
              </table>


              <!-- Expiry -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  background:#fafafa;
                  border-radius:12px;
                  margin-bottom:24px;
                "
              >
                <tr>

                  <td
                    width="35"
                    valign="top"
                    style="
                      padding:15px 0 15px 15px;
                      font-size:17px;
                    "
                  >
                    ⏱
                  </td>

                  <td
                    style="
                      padding:14px 15px 14px 8px;
                      color:#555555;
                      font-size:13px;
                      line-height:1.5;
                    "
                  >
                    <strong style="color:#333333;">
                      This code expires in 10 minutes.
                    </strong>
                    <br />
                    For your security, never share your verification
                    code with anyone.
                  </td>

                </tr>
              </table>


              <p
                style="
                  margin:0;
                  color:#888888;
                  font-size:13px;
                  line-height:1.6;
                "
              >
                Didn't request this code?
                No worries — you can safely ignore this email.
              </p>

            </td>
          </tr>


          <!-- Footer -->
          <tr>
            <td
              style="
                background:#1f1f1f;
                padding:26px 32px;
              "
            >

              <div
                style="
                  color:#ffffff;
                  font-size:16px;
                  font-weight:800;
                  margin-bottom:7px;
                "
              >
                SmartCity Portal
              </div>

              <div
                style="
                  color:#a9a9a9;
                  font-size:12px;
                  line-height:1.6;
                "
              >
                Your city. Your voice.
                <br />
                Making civic services simpler,
                one report at a time.
              </div>

              <div
                style="
                  border-top:1px solid #383838;
                  margin-top:20px;
                  padding-top:15px;
                  color:#777777;
                  font-size:11px;
                "
              >
                This is an automated message. Please do not reply to this email.
              </div>

            </td>
          </tr>

        </table>

      </td>
    </tr>

  </table>

</body>
</html>
    `,
  });
}