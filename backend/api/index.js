// Vercel Node runtime entry point. Vercel imports this module and calls the
// exported Express app directly as a serverless function on every request —
// app.listen() is never invoked (and isn't needed) in this environment.
import app from '../src/app.js';
export default app;
