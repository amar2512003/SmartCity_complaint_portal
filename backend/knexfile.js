import 'dotenv/config';
import { pgSslConfig } from './src/config/ssl.js';
// Migrations run DDL and should use a direct/session connection, not the
// transaction pooler. Falls back to DATABASE_URL if no separate one is set.
const migrationUrl = process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL;
export default {development:{client:'pg',connection:{connectionString:migrationUrl,ssl:pgSslConfig(migrationUrl)},migrations:{directory:'./src/db/migrations'}}};
