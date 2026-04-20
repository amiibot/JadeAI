import { config } from '@/lib/config';
import { SQLiteAdapter, type SQLiteDb } from './adapters/sqlite';
import { PostgreSQLAdapter, type PostgreSQLDb } from './adapters/postgresql';

type Db = SQLiteDb & PostgreSQLDb;

let adapter: SQLiteAdapter | PostgreSQLAdapter;

if (config.db.type === 'postgresql') {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required when DB_TYPE=postgresql');
  }
  adapter = new PostgreSQLAdapter(databaseUrl);
} else {
  if (process.env.VERCEL) {
    throw new Error(
      'SQLite is not supported on Vercel (read-only filesystem). ' +
      'Please set DB_TYPE=postgresql and DATABASE_URL in your Vercel environment variables.',
    );
  }
  adapter = new SQLiteAdapter(process.env.SQLITE_PATH || './data/jade.db');
}

// Initialize (migrate + seed) — must complete before first query.
// Store the promise so consumers can await it if needed.
const _initPromise = adapter.initialize().catch((e) =>
  console.error('[DB] Initialize failed:', e)
);

/** Await this before any DB operation to ensure tables exist */
export const dbReady = _initPromise;

export const db = adapter.db as Db;
export { adapter };
