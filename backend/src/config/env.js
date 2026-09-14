import 'dotenv/config';
const required=['DATABASE_URL','JWT_SECRET'];
for (const key of required) if(!process.env[key]) throw new Error(`Missing environment variable: ${key}`);
export const env={port:Number(process.env.PORT||5000),databaseUrl:process.env.DATABASE_URL,jwtSecret:process.env.JWT_SECRET,groqApiKey:process.env.GROQ_API_KEY||'',groqModel:process.env.GROQ_MODEL||'openai/gpt-oss-120b',frontendUrl:process.env.FRONTEND_URL||'',frontendUrls:(process.env.FRONTEND_URLS||process.env.FRONTEND_URL||'').split(',').map(s=>s.trim()).filter(Boolean),resolutionDistanceThresholdMeters:Number(process.env.RESOLUTION_DISTANCE_THRESHOLD_METERS||150)};
