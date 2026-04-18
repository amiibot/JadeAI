import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';

export interface FamilyUserConfig {
  username: string;
  passwordHash: string;
  name: string;
}

const familyUserSchema = z.object({
  username: z.string().trim().min(1),
  passwordHash: z.string().trim().min(1).refine((value) => {
    const parts = value.split('$');
    return parts.length === 6 && parts[0] === 'scrypt' && parts.every(Boolean);
  }),
  name: z.string().trim().min(1),
});

const familyUsersSchema = z.array(familyUserSchema);

let cachedFamilyUsers: readonly FamilyUserConfig[] | null = null;

function parseFamilyUsers(rawUsers: string) {
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawUsers);
  } catch (error) {
    console.error('[auth] Local auth users must be valid JSON.', error);
    return null;
  }

  const parsedUsers = familyUsersSchema.safeParse(parsedJson);
  if (!parsedUsers.success) {
    console.error('[auth] Local auth users contain invalid entries.', parsedUsers.error.flatten());
    return null;
  }

  const normalizedUsers = parsedUsers.data.map((user) => ({
    username: user.username.trim().toLowerCase(),
    passwordHash: user.passwordHash.trim(),
    name: user.name.trim(),
  }));

  const seenUsernames = new Set<string>();
  for (const user of normalizedUsers) {
    if (seenUsernames.has(user.username)) {
      console.error(`[auth] Duplicate local auth username: ${user.username}`);
      return null;
    }
    seenUsernames.add(user.username);
  }

  return normalizedUsers;
}

function loadUsersFromPath(pathValue: string) {
  try {
    const filePath = resolve(process.cwd(), pathValue);
    return readFileSync(filePath, 'utf8').trim();
  } catch (error) {
    console.error(`[auth] Failed to read LOCAL_AUTH_USERS_PATH: ${pathValue}`, error);
    return null;
  }
}

function loadFamilyUsers() {
  if (cachedFamilyUsers) {
    return cachedFamilyUsers;
  }

  const usersPath = process.env.LOCAL_AUTH_USERS_PATH?.trim();
  if (!usersPath) {
    console.error('[auth] Missing LOCAL_AUTH_USERS_PATH configuration.');
    cachedFamilyUsers = [];
    return cachedFamilyUsers;
  }

  const rawUsers = loadUsersFromPath(usersPath);
  if (!rawUsers) {
    cachedFamilyUsers = [];
    return cachedFamilyUsers;
  }

  const parsedUsers = parseFamilyUsers(rawUsers);
  if (!parsedUsers) {
    cachedFamilyUsers = [];
    return cachedFamilyUsers;
  }

  cachedFamilyUsers = parsedUsers;
  return cachedFamilyUsers;
}

export function findFamilyUserByUsername(username: string) {
  const normalized = username.trim().toLowerCase();
  return loadFamilyUsers().find((user) => user.username === normalized) ?? null;
}
