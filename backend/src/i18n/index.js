// Server-side i18next instance, used to translate API messages and email
// copy. Kept separate from react-i18next on the frontend — same JSON-key
// convention, no React dependency here.
//
// Sprint 1 scope: wiring + a smoke-test key only. Sprint 3 adds the first
// real message keys, covering citizen auth (controller responses + Zod
// validation messages). Later sprints (grievances, admin, etc.) follow the
// same `namespace:key` pattern established here.
import i18next from 'i18next';

const resources = {
  en: {
    common: {
      smoke_test: 'Localization is working',
      internal_server_error: 'Internal server error',
    },
    auth: {
      email_already_registered: 'Email already registered',
      otp_sent: 'OTP sent to your email',
      otp_send_failed: 'Unable to send OTP. Check the email service configuration.',
      no_active_otp: 'No active OTP request found. Please request a new OTP.',
      otp_expired: 'OTP has expired. Please request a new one.',
      too_many_attempts: 'Too many incorrect attempts. Please request a new OTP.',
      incorrect_otp: 'Incorrect OTP. Please try again.',
      signup_success: 'Email verified and account created',
      no_citizen_account: 'No citizen account found with this email',
      citizen_account_not_found: 'Citizen account not found',
      login_success: 'Login successful',
      preferred_language_updated: 'Preferred language updated',
      admin_invalid_credentials: 'Invalid admin credentials',
      admin_login_success: 'Admin login successful',
      authentication_required: 'Authentication required',
      invalid_or_expired_token: 'Invalid or expired token',
      forbidden: 'You do not have permission to perform this action',
    },
    validation: {
      invalid_request: 'Invalid request',
      email_invalid: 'Enter a valid email address',
      name_min: 'Name must be at least 2 characters',
      otp_format: 'OTP must be 6 digits',
      language_invalid: 'Language must be "en" or "bn"',
      invalid_status: 'Invalid status',
      password_min: 'Password must be at least 6 characters',
      resolution_photo_required: 'A photo is required to resolve this grievance',
      resolution_location_required: 'Location could not be captured for the resolution photo',
    },
    grievance: {
      create_success: 'Grievance submitted',
      create_failed: 'Could not submit the grievance. Please try again.',
      fetch_failed: 'Could not load your grievances.',
      photo_required: 'Photo evidence is required',
      not_found: 'Grievance not found',
      status_updated: 'Status updated',
      fetch_all_failed: 'Could not load grievances.',
      update_status_failed: 'Could not update the grievance status.',
      resolve_success: 'Grievance marked as resolved',
      missing_original_location: 'This grievance has no reported location on file, so a resolution photo cannot be location-verified.',
      location_mismatch: 'You are about {{distance}}m from the reported location. Move within {{threshold}}m of the site and try again.',
    },
    assistant: {
      not_configured: 'AI assistant is not configured. Ask the administrator to set GROQ_API_KEY.',
      messages_required: 'messages array is required',
      off_topic_reply: 'I\'m here to help with the Samadhan portal and civic grievance services. I can help you submit a grievance, track a complaint, understand categories, location capture, routing, or other Samadhan features.',
      unavailable: 'The AI assistant is unavailable right now. Please try again shortly.',
      empty_response: 'The AI assistant returned an empty response.',
      unreachable: 'Could not reach the AI assistant.',
    },
  },
  bn: {
    common: {
      smoke_test: 'লোকালাইজেশন কাজ করছে',
      internal_server_error: 'সার্ভারের অভ্যন্তরীণ ত্রুটি',
    },
    auth: {
      email_already_registered: 'এই ইমেলটি ইতিমধ্যে নিবন্ধিত',
      otp_sent: 'আপনার ইমেলে OTP পাঠানো হয়েছে',
      otp_send_failed: 'OTP পাঠানো যায়নি। ইমেল পরিষেবার কনফিগারেশন পরীক্ষা করুন।',
      no_active_otp: 'কোনো সক্রিয় OTP অনুরোধ পাওয়া যায়নি। অনুগ্রহ করে নতুন OTP অনুরোধ করুন।',
      otp_expired: 'OTP-এর মেয়াদ শেষ হয়ে গেছে। অনুগ্রহ করে একটি নতুন OTP অনুরোধ করুন।',
      too_many_attempts: 'অনেকবার ভুল চেষ্টা করা হয়েছে। অনুগ্রহ করে নতুন OTP অনুরোধ করুন।',
      incorrect_otp: 'ভুল OTP। অনুগ্রহ করে আবার চেষ্টা করুন।',
      signup_success: 'ইমেল যাচাই করা হয়েছে এবং অ্যাকাউন্ট তৈরি হয়েছে',
      no_citizen_account: 'এই ইমেল দিয়ে কোনো নাগরিক অ্যাকাউন্ট পাওয়া যায়নি',
      citizen_account_not_found: 'নাগরিক অ্যাকাউন্ট পাওয়া যায়নি',
      login_success: 'সফলভাবে লগইন হয়েছে',
      preferred_language_updated: 'পছন্দের ভাষা আপডেট করা হয়েছে',
      admin_invalid_credentials: 'অবৈধ অ্যাডমিন প্রমাণপত্র',
      admin_login_success: 'অ্যাডমিন সফলভাবে লগইন হয়েছে',
      authentication_required: 'প্রমাণীকরণ আবশ্যক',
      invalid_or_expired_token: 'টোকেন অবৈধ বা মেয়াদোত্তীর্ণ',
      forbidden: 'এই কাজটি করার অনুমতি আপনার নেই',
    },
    validation: {
      invalid_request: 'অবৈধ অনুরোধ',
      email_invalid: 'একটি সঠিক ইমেল ঠিকানা লিখুন',
      name_min: 'নাম কমপক্ষে ২ অক্ষরের হতে হবে',
      otp_format: 'OTP অবশ্যই ৬ সংখ্যার হতে হবে',
      language_invalid: 'ভাষা অবশ্যই "en" অথবা "bn" হতে হবে',
      invalid_status: 'অবৈধ স্ট্যাটাস',
      password_min: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে',
      resolution_photo_required: 'এই অভিযোগটি সমাধান করতে একটি ছবি আবশ্যক',
      resolution_location_required: 'সমাধানের ছবির জন্য অবস্থান শনাক্ত করা যায়নি',
    },
    grievance: {
      create_success: 'অভিযোগ জমা দেওয়া হয়েছে',
      create_failed: 'অভিযোগটি জমা দেওয়া যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।',
      fetch_failed: 'আপনার অভিযোগগুলি লোড করা যায়নি।',
      photo_required: 'ছবির প্রমাণ আবশ্যক',
      not_found: 'অভিযোগ পাওয়া যায়নি',
      status_updated: 'স্ট্যাটাস আপডেট করা হয়েছে',
      fetch_all_failed: 'অভিযোগ লোড করা যায়নি।',
      update_status_failed: 'অভিযোগের স্ট্যাটাস আপডেট করা যায়নি।',
      resolve_success: 'অভিযোগটি সমাধান হয়েছে বলে চিহ্নিত করা হয়েছে',
      missing_original_location: 'এই অভিযোগে কোনো রিপোর্ট করা অবস্থান নেই, তাই সমাধানের ছবিটি অবস্থান-যাচাই করা যাবে না।',
      location_mismatch: 'আপনি রিপোর্ট করা অবস্থান থেকে প্রায় {{distance}} মিটার দূরে আছেন। সাইটের {{threshold}} মিটারের মধ্যে গিয়ে আবার চেষ্টা করুন।',
    },
    assistant: {
      not_configured: 'AI অ্যাসিস্ট্যান্ট কনফিগার করা নেই। প্রশাসককে GROQ_API_KEY সেট করতে বলুন।',
      messages_required: 'messages অ্যারে আবশ্যক',
      off_topic_reply: 'আমি শুধুমাত্র স্মার্টসিটি পোর্টাল এবং নাগরিক অভিযোগ পরিষেবা সংক্রান্ত বিষয়ে সাহায্য করতে পারি। আমি আপনাকে অভিযোগ জমা দিতে, অভিযোগ ট্র্যাক করতে, বিভাগ বুঝতে, অবস্থান ক্যাপচার, রাউটিং, বা অন্যান্য স্মার্টসিটি ফিচার সম্পর্কে সাহায্য করতে পারি।',
      unavailable: 'AI অ্যাসিস্ট্যান্ট এই মুহূর্তে উপলব্ধ নেই। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।',
      empty_response: 'AI অ্যাসিস্ট্যান্ট থেকে কোনো উত্তর পাওয়া যায়নি।',
      unreachable: 'AI অ্যাসিস্ট্যান্টের সাথে যোগাযোগ করা যায়নি।',
    },
  },
};

await i18next.init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  supportedLngs: ['en', 'bn'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
});

/**
 * Translate a message key for a given language, falling back to English.
 * @param {string} key
 * @param {'en'|'bn'} lang
 * @param {Record<string, unknown>} [options] interpolation values, e.g. { distance: 340 }
 */
export function t(key, lang = 'en', options = {}) {
  return i18next.t(key, { lng: lang, ...options });
}

export default i18next;
