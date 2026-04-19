/**
 * Repair JSON columns that may have been saved as stringified JSON or fragmented objects.
 *
 * Usage: tsx scripts/repair-json-columns.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { normalizeThemeConfig, normalizeUserSettings } from '../src/lib/db/json-normalize';

const DB_PATH = process.env.SQLITE_PATH || './data/jade.db';

function main() {
  const dbPath = path.resolve(process.cwd(), DB_PATH);
  if (!fs.existsSync(dbPath)) {
    process.stderr.write(`[repair-json-columns] DB not found: ${dbPath}\n`);
    process.exit(1);
  }

  const db = new Database(dbPath);
  const tx = db.transaction(() => {
    const users = db.prepare('select id, settings from users').all() as Array<{ id: string; settings: unknown }>;
    const resumes = db.prepare('select id, theme_config from resumes').all() as Array<{ id: string; theme_config: unknown }>;

    let userCount = 0;
    for (const row of users) {
      const settings = normalizeUserSettings(row.settings);
      db.prepare('update users set settings = ?, updated_at = ? where id = ?').run(JSON.stringify(settings), Math.floor(Date.now() / 1000), row.id);
      userCount++;
    }

    let resumeCount = 0;
    for (const row of resumes) {
      const themeConfig = normalizeThemeConfig(row.theme_config);
      db.prepare('update resumes set theme_config = ?, updated_at = ? where id = ?').run(JSON.stringify(themeConfig), Math.floor(Date.now() / 1000), row.id);
      resumeCount++;
    }

    return { userCount, resumeCount };
  });

  const result = tx();
  db.close();
  process.stderr.write(`[repair-json-columns] Repaired ${result.userCount} users and ${result.resumeCount} resumes\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`[repair-json-columns] Failed: ${String(error)}\n`);
  process.exit(1);
}
