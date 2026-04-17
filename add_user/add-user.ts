import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import type { FamilyUserConfig } from '../src/lib/auth/family-users';
import { hashLocalPassword } from '../src/lib/auth/password';

type LocalAuthUser = FamilyUserConfig;

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const USERS_FILE_PATH = resolve(SCRIPT_DIR, 'LOCAL_AUTH_USERS_JSON.json');

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

function normalizeName(value: string) {
  return value.trim();
}

function isValidPasswordHash(value: string) {
  const parts = value.split('$');
  return parts.length === 6 && parts[0] === 'scrypt' && parts.every(Boolean);
}

function parseUsers(raw: string): LocalAuthUser[] {
  if (!raw.trim()) {
    return [];
  }

  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error('The add_user data file must contain a JSON array.');
  }

  const users = parsed.map((entry, index) => {
    if (!entry || typeof entry !== 'object') {
      throw new Error(`User #${index + 1} must be an object.`);
    }

    const record = entry as Record<string, unknown>;
    const username = typeof record.username === 'string' ? normalizeUsername(record.username) : '';
    const name = typeof record.name === 'string' ? normalizeName(record.name) : '';
    const passwordHash = typeof record.passwordHash === 'string' ? record.passwordHash.trim() : '';

    if (!username) {
      throw new Error(`User #${index + 1} is missing username.`);
    }

    if (!name) {
      throw new Error(`User #${index + 1} is missing name.`);
    }

    if (!passwordHash) {
      throw new Error(`User #${index + 1} is missing passwordHash.`);
    }

    if (!isValidPasswordHash(passwordHash)) {
      throw new Error(`User #${index + 1} has an invalid passwordHash.`);
    }

    return { username, name, passwordHash };
  });

  const seenUsernames = new Set<string>();
  for (const user of users) {
    if (seenUsernames.has(user.username)) {
      throw new Error(`Duplicate username in add_user data file: ${user.username}`);
    }
    seenUsernames.add(user.username);
  }

  return users;
}

async function loadUsers() {
  await mkdir(SCRIPT_DIR, { recursive: true });

  try {
    const raw = await readFile(USERS_FILE_PATH, 'utf8');
    return parseUsers(raw);
  } catch (error) {
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

async function saveUsers(users: LocalAuthUser[]) {
  await writeFile(USERS_FILE_PATH, `${JSON.stringify(users)}\n`, 'utf8');
}

async function askLine(question: string, trim = true) {
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    const answer = await rl.question(question);
    return trim ? answer.trim() : answer;
  } finally {
    rl.close();
  }
}

async function askText(question: string) {
  return askLine(question, true);
}

async function askPassword(question: string) {
  if (!stdin.isTTY || !stdout.isTTY) {
    return askLine(question, false);
  }

  stdout.write(question);

  return new Promise<string>((resolve, reject) => {
    const wasRawMode = stdin.isRaw;
    const chunks: string[] = [];

    const cleanup = () => {
      stdin.off('data', onData);
      if (stdin.isTTY && stdin.isRaw !== wasRawMode) {
        stdin.setRawMode(Boolean(wasRawMode));
      }
      stdin.pause();
    };

    const finish = (value: string) => {
      cleanup();
      stdout.write('\n');
      resolve(value);
    };

    const abort = () => {
      cleanup();
      stdout.write('\n');
      reject(new Error('Interrupted.'));
    };

    const onData = (input: string) => {
      for (const char of input) {
        if (char === '\r' || char === '\n') {
          finish(chunks.join(''));
          return;
        }

        if (char === '\u0003') {
          abort();
          return;
        }

        if (char === '\u007f' || char === '\b') {
          chunks.pop();
          stdout.write('\b \b');
          continue;
        }

        if (char === '\u001b') {
          continue;
        }

        chunks.push(char);
        stdout.write('*');
      }
    };

    stdin.setEncoding('utf8');
    stdin.resume();
    stdin.setRawMode(true);
    stdin.on('data', onData);
  });
}

async function promptNonEmpty(question: string, fieldName: string) {
  while (true) {
    const value = await askText(question);
    if (value) {
      return value;
    }

    console.error(`[add_user] ${fieldName} cannot be empty.`);
  }
}

async function promptUniqueUsername(existingUsers: LocalAuthUser[]) {
  while (true) {
    const username = normalizeUsername(await askText('username: '));

    if (!username) {
      console.error('[add_user] username cannot be empty.');
      continue;
    }

    if (existingUsers.some((user) => user.username === username)) {
      console.error(`[add_user] username already exists: ${username}`);
      continue;
    }

    return username;
  }
}

async function promptPassword() {
  while (true) {
    const password = await askPassword('password: ');
    if (password) {
      return password;
    }

    console.error('[add_user] password cannot be empty.');
  }
}

async function promptContinue() {
  while (true) {
    const choice = await askText('继续录入? [1=继续, 0=退出]: ');

    if (choice === '1') {
      return true;
    }

    if (choice === '0') {
      return false;
    }

    console.error('[add_user] Please enter 1 or 0.');
  }
}

async function main() {
  const users = await loadUsers();

  console.log(`[add_user] data file: ${USERS_FILE_PATH}`);
  console.log(`[add_user] current users: ${users.length}`);

  let currentUsers = users;
  while (true) {
    const username = await promptUniqueUsername(currentUsers);
    const name = normalizeName(await promptNonEmpty('name: ', 'name'));
    const password = await promptPassword();

    const passwordHash = hashLocalPassword(password);
    const nextUsers: LocalAuthUser[] = [
      ...currentUsers,
      {
        username,
        name,
        passwordHash,
      },
    ];

    await saveUsers(nextUsers);
    currentUsers = nextUsers;

    console.log(`[add_user] added user: ${username}`);
    console.log(`[add_user] total users: ${currentUsers.length}`);

    const shouldContinue = await promptContinue();
    if (!shouldContinue) {
      break;
    }
  }
}

main().catch((error) => {
  console.error('[add_user] Failed:', error);
  process.exit(1);
});
