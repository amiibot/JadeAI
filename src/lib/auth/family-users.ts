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

function loadFamilyUsers() {
  if (cachedFamilyUsers) {
    return cachedFamilyUsers;
  }

  const rawUsers = process.env.LOCAL_AUTH_USERS_JSON?.trim();
  if (!rawUsers) {
    console.error('[auth] Missing LOCAL_AUTH_USERS_JSON configuration.');
    cachedFamilyUsers = [];
    return cachedFamilyUsers;
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawUsers);
  } catch (error) {
    console.error('[auth] LOCAL_AUTH_USERS_JSON must be valid JSON.', error);
    cachedFamilyUsers = [];
    return cachedFamilyUsers;
  }

  const parsedUsers = familyUsersSchema.safeParse(parsedJson);
  if (!parsedUsers.success) {
    console.error('[auth] LOCAL_AUTH_USERS_JSON contains invalid users.', parsedUsers.error.flatten());
    cachedFamilyUsers = [];
    return cachedFamilyUsers;
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
      cachedFamilyUsers = [];
      return cachedFamilyUsers;
    }
    seenUsernames.add(user.username);
  }

  cachedFamilyUsers = normalizedUsers;
  return cachedFamilyUsers;
}

export function findFamilyUserByUsername(username: string) {
  const normalized = username.trim().toLowerCase();
  return loadFamilyUsers().find((user) => user.username === normalized) ?? null;
}
