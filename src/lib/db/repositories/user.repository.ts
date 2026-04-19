import { eq } from 'drizzle-orm';
import { db } from '../index';
import { users } from '../schema';
import { createSampleResume } from '../sample-resume';
import { normalizeUserSettings } from '../json-normalize';

const SETTINGS_KEYS = ['aiProvider', 'aiBaseURL', 'aiModel', 'autoSave', 'autoSaveInterval'] as const;

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

function pickSettings(value: Record<string, unknown>) {
  const filtered: Record<string, unknown> = {};
  for (const key of SETTINGS_KEYS) {
    if (key in value) filtered[key] = value[key];
  }
  return filtered;
}

export const userRepository = {
  async findById(id: string) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  },

  async findByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] || null;
  },

  async findByUsername(username: string) {
    const normalizedUsername = normalizeUsername(username);
    const result = await db.select().from(users).where(eq(users.username, normalizedUsername)).limit(1);
    return result[0] || null;
  },

  async findOrCreateByLocalUsername(data: { username: string; name?: string }) {
    const normalizedUsername = normalizeUsername(data.username);
    const existing = await this.findByUsername(normalizedUsername);
    if (existing) return existing;

    const id = crypto.randomUUID();
    await db.insert(users).values({
      id,
      username: normalizedUsername,
      name: data.name,
      authType: 'local',
    });

    await createSampleResume(id);
    return this.findById(id);
  },

  async create(data: { id?: string; email?: string; name?: string; avatarUrl?: string; username?: string; authType: 'local' }) {
    const id = data.id || crypto.randomUUID();
    await db.insert(users).values({ ...data, id });
    return this.findById(id);
  },

  async update(id: string, data: Partial<{ name: string; avatarUrl: string }>) {
    await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, id));
    return this.findById(id);
  },

  async getSettings(id: string) {
    const result = await db.select({ settings: users.settings }).from(users).where(eq(users.id, id)).limit(1);
    return normalizeUserSettings(result[0]?.settings);
  },

  async updateSettings(id: string, settings: Record<string, unknown>) {
    const current = normalizeUserSettings((await db.select({ settings: users.settings }).from(users).where(eq(users.id, id)).limit(1))[0]?.settings);
    const merged = { ...current, ...pickSettings(settings) };
    await db.update(users).set({ settings: merged, updatedAt: new Date() }).where(eq(users.id, id));
    return merged;
  },
};
