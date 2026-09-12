import nodemailer from "nodemailer";
import crypto from "crypto";

function required(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

// Reuse a single transporter across calls instead of recreating one per email.
// Re-authenticating on every send looks bursty to some providers and is just
// slower; a shared, pooled connection is both faster and slightly better
// for reputation.
let transporter;
function getTransporter() {
  if (transporter) return transporter;

  const config = {
    host: required("SMTP_HOST"),
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    pool: true,
    auth: {
      user: required("SMTP_USER"),
      pass: required("SMTP_PASS"),
    },
  };

  // DKIM is the single biggest lever you have here. Without it, Gmail/Yahoo/
  // Outlook score you as much more likely to be spoofed, which is enough on
  // its own to route mail to spam regardless of content. Skip this block only
  // if your provider (SES, SendGrid, Resend, Postmark, etc.) already signs
  // outgoing mail for you — check their dashboard/docs to confirm before
  // assuming you don't need it.
  if (process.env.DKIM_PRIVATE_KEY) {
    config.dkim = {
      domainName: required("DKIM_DOMAIN"),
      keySelector: process.env.DKIM_SELECTOR || "default",
      privateKey: required("DKIM_PRIVATE_KEY"),
    };
  }

  transporter = nodemailer.createTransport(config);
  return transporter;
}

// OTP email copy, in the citizen's language. Selected in
// auth.citizen.controller.js: the citizen's saved preferred_language for
// login OTPs, or the language of the signup request itself (req.lang) when
// signing up, since there's no user record yet to read a preference from.
const OTP_EMAIL_COPY = {
  en: {
    subject: (otp) => `${otp} — Your SmartCity verification code`,
    headlineLine1: "Let's make",
    headlineLine2: "Kolkata better.",
    tagline: "Your city. Your voice.",
    eyebrow: "Email verification",
    title: "Verify your email",
    intro: (firstName) =>
      `Hi ${firstName}, you're almost there. Use the verification code below to continue with your SmartCity account.`,
    codeLabel: "Your verification code",
    expiresStrong: "This code expires in 10 minutes.",
    expiresNote: "For your security, never share your verification code with anyone.",
    cantFind: "Can't find this email?",
    cantFindNote:
      'Please check your Spam or Promotions folder — and consider marking this address as "Not spam" so future codes arrive in your inbox.',
    didntRequest: "Didn't request this code? No worries — you can safely ignore this email.",
    footerTagline: "Your city. Your voice.",
    footerMaking: "Making civic services simpler, one report at a time.",
    automated: "This is an automated message. Please do not reply to this email.",
    textGreeting: (firstName) => `Hi ${firstName},`,
    textIntro: "Use the verification code below to continue with your SmartCity account:",
    textExpiry: "This code is valid for 10 minutes.",
    textSecurity: "For your security, please do not share this code with anyone.",
    textIgnore: "If you didn't request this verification code, you can safely ignore this email.",
  },
  bn: {
    subject: (otp) => `${otp} — আপনার SmartCity যাচাইকরণ কোড`,
    headlineLine1: "আসুন",
    headlineLine2: "কলকাতাকে আরও ভালো করি।",
    tagline: "আপনার শহর। আপনার কণ্ঠস্বর।",
    eyebrow: "ইমেল যাচাইকরণ",
    title: "আপনার ইমেল যাচাই করুন",
    intro: (firstName) =>
      `হ্যালো ${firstName}, আপনি প্রায় শেষ পর্যায়ে। আপনার SmartCity অ্যাকাউন্ট চালিয়ে যেতে নিচের যাচাইকরণ কোডটি ব্যবহার করুন।`,
    codeLabel: "আপনার যাচাইকরণ কোড",
    expiresStrong: "এই কোডের মেয়াদ ১০ মিনিটে শেষ হবে।",
    expiresNote: "নিরাপত্তার জন্য, আপনার যাচাইকরণ কোড কারো সাথে শেয়ার করবেন না।",
    cantFind: "এই ইমেলটি খুঁজে পাচ্ছেন না?",
    cantFindNote:
      'অনুগ্রহ করে আপনার স্প্যাম বা প্রোমোশনস ফোল্ডার দেখুন — এবং ভবিষ্যতে কোড ইনবক্সে পেতে এই ঠিকানাটিকে "স্প্যাম নয়" হিসেবে চিহ্নিত করার কথা বিবেচনা করুন।',
    didntRequest: "এই কোডটি অনুরোধ করেননি? চিন্তা নেই — আপনি নিশ্চিন্তে এই ইমেলটি উপেক্ষা করতে পারেন।",
    footerTagline: "আপনার শহর। আপনার কণ্ঠস্বর।",
    footerMaking: "নাগরিক পরিষেবা সহজ করা, একটি রিপোর্ট এ একবার।",
    automated: "এটি একটি স্বয়ংক্রিয় বার্তা। অনুগ্রহ করে এই ইমেলের উত্তর দেবেন না।",
    textGreeting: (firstName) => `হ্যালো ${firstName},`,
    textIntro: "আপনার SmartCity অ্যাকাউন্ট চালিয়ে যেতে নিচের যাচাইকরণ কোডটি ব্যবহার করুন:",
    textExpiry: "এই কোডটি ১০ মিনিটের জন্য বৈধ।",
    textSecurity: "নিরাপত্তার জন্য, অনুগ্রহ করে এই কোডটি কারো সাথে শেয়ার করবেন না।",
    textIgnore: "যদি আপনি এই যাচাইকরণ কোডটি অনুরোধ না করে থাকেন, তাহলে আপনি নিশ্চিন্তে এই ইমেলটি উপেক্ষা করতে পারেন।",
  },
};

export async function sendOtpEmail({ to, otp, name, lang }) {
  // Falls back to a neutral greeting if no name was captured at signup.
  const firstName = (name || "").trim().split(/\s+/)[0] || "there";
  const copy = OTP_EMAIL_COPY[lang] || OTP_EMAIL_COPY.en;

  const fromAddress = required("SMTP_USER");
  // SMTP_FROM should be a mailbox on a domain you control with SPF/DKIM/DMARC
  // configured in DNS. Falls back to SMTP_USER.
  const senderAddress = process.env.SMTP_FROM || fromAddress;
  const senderDomain = senderAddress.split("@")[1] || "smartcity-portal";
  const messageId = `<${crypto.randomUUID()}@${senderDomain}>`;

  await getTransporter().sendMail({
    from: `SmartCity Portal <${senderAddress}>`,
    to,
    replyTo: senderAddress,
    // Ties the envelope sender to the same domain as the header From —
    // a mismatch here is one of the more common reasons a message that
    // "looks fine" still gets spam-scored.
    envelope: { from: senderAddress, to },
    messageId,
    subject: copy.subject(otp),

    // Gmail/Yahoo's bulk-sender rules increasingly weight the presence of a
    // List-Unsubscribe header even for transactional mail. mailto: is enough
    // here — it doesn't need to do anything meaningful for a pure OTP email,
    // it just needs to exist.
    headers: {
      "List-Unsubscribe": `<mailto:${senderAddress}?subject=unsubscribe>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },

    text: `
SmartCity Portal
${copy.tagline}

${copy.textGreeting(firstName)}

${copy.textIntro}

${otp}

${copy.textExpiry}

${copy.textSecurity}

${copy.textIgnore}

SmartCity Portal
${copy.footerMaking}
    `,

    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SmartCity Verification</title>
</head>

<!-- No @import/web font here on purpose — Gmail, Outlook desktop, and
     several other clients strip <style>-based @import or ignore it
     entirely, so a webfont can't be relied on for the OTP code itself.
     Instead the stack lists common Bengali-capable system fonts (Noto Sans
     Bengali on Android/Chrome OS, Nirmala UI on Windows, Vrinda as an older
     Windows fallback) ahead of the final generic sans-serif, so each
     client's own font-substitution picks a glyph-complete font for the
     Bengali variant instead of leaving conjuncts to chance. -->
<body
  style="
    margin:0;
    padding:0;
    background:#f4f4f4;
    font-family: Arial, Helvetica, 'Noto Sans Bengali', 'Nirmala UI', 'Vrinda', 'Mukta', sans-serif;
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
                ${copy.tagline}
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
                ${copy.headlineLine1}<br />
                ${copy.headlineLine2}
              </div>

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
                ${copy.eyebrow}
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
                ${copy.title}
              </h1>

              <p
                style="
                  margin:0;
                  color:#6f6f6f;
                  font-size:15px;
                  line-height:1.7;
                "
              >
                ${copy.intro(firstName)}
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
                      ${copy.codeLabel}
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
                      ${copy.expiresStrong}
                    </strong>
                    <br />
                    ${copy.expiresNote}
                  </td>

                </tr>
              </table>

              <p
                style="
                  margin:0 0 4px;
                  color:#333333;
                  font-size:13px;
                  font-weight:700;
                "
              >
                ${copy.cantFind}
              </p>

              <p
                style="
                  margin:0;
                  color:#888888;
                  font-size:12.5px;
                  line-height:1.6;
                "
              >
                ${copy.cantFindNote}
              </p>

              <p
                style="
                  margin:16px 0 0;
                  color:#888888;
                  font-size:13px;
                  line-height:1.6;
                "
              >
                ${copy.didntRequest}
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
                ${copy.footerTagline}
                <br />
                ${copy.footerMaking}
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
                ${copy.automated}
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