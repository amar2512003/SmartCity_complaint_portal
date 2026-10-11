# Kolkata UI redesign

The React frontend retains its Vercel deployment and existing backend API. The redesign covers citizen signup/login/OTP, admin login, both dashboards, report creation, citizen and admin report details, photo capture and previews, resolution dialogs, and help panels. English/Bengali translations remain available.

## Design

Warm ivory surfaces, vermilion actions, serif headings, and a watercolor Kolkata cityscape follow the supplied visual references. Shared Brand, AuthLayout, and AppHeader components keep the pages consistent. `Frontend/src/redesign.css` applies the design over the existing functional base stylesheet.

The image asset is `Frontend/src/assets/kolkata-waterfront.webp` (approximately 353 KiB). Generated using the built-in image-generation tool and compressed to WebP for the website. Final prompt:

> Create a wide landscape watercolor and fine ink illustration for a Kolkata civic website, no text or interface. Warm ivory paper background #fff4df, sunset amber and vermilion, deep teal foliage. Howrah Bridge across the Hooghly river, Victoria Memorial on right, yellow Ambassador taxi and a vintage blue-yellow tram at the bottom left, ornate black riverside lamp and flowering red gulmohar branches framing the far left. River ferry and railings. Elegant detailed travel-poster illustration, hand-painted textured washes, welcoming nostalgic Kolkata. Composition: open pale ivory sky in upper half for overlayed website headings; architectural details concentrated in bottom half, decorative floral corners. Wide 3:2 landscape image. Absolutely no lettering, words, logos, typography, UI cards or borders.

## Mobile and accessibility changes

- Navigation and sign-out remain visible on phones; report tables become labelled cards.
- Forms use 16px input text, autocomplete, associated labels, and OTP autofill.
- Dynamic viewport sizing and safe-area spacing keep overlays usable on small screens.
- Dialogs support Escape, focus containment, and restoration. Guide and assistant panels cannot overlap.
- Reduced-motion preferences are respected; the greeting no longer animates through unreadable partial text.
- Camera initialization waits until the video element exists. Streams stop on closure or unmount; late permission results do not leave the camera running.
- A photo-picker fallback is available without opening the camera. Uploaded photo stamping waits for the location result rather than an arbitrary delay.
- The admin district filter retains its selection when switching languages.
- Loading states distinguish a pending request from an empty list.

## Verification

Browser checks used Playwright Chromium and WebKit at 320, 390, 768, and 1440px. Verified authentication pages, empty/populated dashboards, citizen details, report form, admin dashboard, Bengali admin text, help-panel switching, Escape dismissal, camera dialog, and resolution dialog. No horizontal page overflow was detected.

Mobile flow tests in both engines used an intercepted test API and simulated geolocation: signup, OTP entry, photo upload/stamping, report submission, sign-out, and OTP login. No test complaints or OTP emails were sent to the live service. These are browser-engine checks, not a guarantee across all physical devices; real iPhone/Android camera permissions, keyboards, GPS accuracy, and network conditions should still receive a device smoke test.

Production build: `cd Frontend && npm run build`.
