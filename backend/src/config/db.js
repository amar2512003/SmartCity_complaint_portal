import knex from 'knex';
import { env } from './env.js';
import { pgSslConfig } from './ssl.js';
export const db=knex({client:'pg',connection:{connectionString:env.databaseUrl,ssl:pgSslConfig(env.databaseUrl)}});
