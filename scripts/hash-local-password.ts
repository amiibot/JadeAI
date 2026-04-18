/**
 * Generate a local auth password hash for local auth user JSON files.
 *
 * Usage: pnpm auth:hash -- "plain-password"
 */

import { hashLocalPassword } from '../src/lib/auth/password';

function main() {
  const password = process.argv[2]?.trim();

  if (!password) {
    console.error('[auth:hash] Usage: pnpm auth:hash -- "plain-password"');
    process.exit(1);
  }

  const passwordHash = hashLocalPassword(password);
  console.log(passwordHash);
}

try {
  main();
} catch (error) {
  console.error('[auth:hash] Failed:', error);
  process.exit(1);
}
