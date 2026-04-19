import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../index';
import { resumes, resumeSections } from '../schema';
import { normalizeThemeConfig } from '../json-normalize';

export const resumeRepository = {
  async findAllByUserId(userId: string) {
    const items = await db.select().from(resumes).where(eq(resumes.userId, userId)).orderBy(desc(resumes.updatedAt));
    return items.map((resume: { themeConfig: unknown }) => ({ ...resume, themeConfig: normalizeThemeConfig(resume.themeConfig) }));
  },

  async findById(id: string) {
    const resume = await db.select().from(resumes).where(eq(resumes.id, id)).limit(1);
    if (!resume[0]) return null;
    const sections = await db.select().from(resumeSections).where(eq(resumeSections.resumeId, id)).orderBy(resumeSections.sortOrder);
    return { ...resume[0], themeConfig: normalizeThemeConfig(resume[0].themeConfig), sections };
  },

  async create(data: { userId: string; title?: string; template?: string; language?: string; themeConfig?: unknown }) {
    const id = crypto.randomUUID();
    await db.insert(resumes).values({
      id,
      userId: data.userId,
      title: data.title || '未命名简历',
      template: data.template || 'classic',
      themeConfig: normalizeThemeConfig(data.themeConfig),
      language: data.language || 'zh',
    });
    return this.findById(id);
  },

  async update(id: string, data: Partial<{ title: string; template: string; themeConfig: unknown; language: string }>) {
    const payload = {
      ...(data.title && { title: data.title }),
      ...(data.template && { template: data.template }),
      ...(data.language && { language: data.language }),
      ...(data.themeConfig !== undefined && { themeConfig: normalizeThemeConfig(data.themeConfig) }),
      updatedAt: new Date(),
    };
    await db.update(resumes).set(payload).where(eq(resumes.id, id));
    return this.findById(id);
  },

  async delete(id: string) {
    await db.delete(resumes).where(eq(resumes.id, id));
  },

  async duplicate(id: string, userId: string, titleOverride?: string) {
    const original = await this.findById(id);
    if (!original) return null;

    const newId = crypto.randomUUID();
    await db.insert(resumes).values({
      id: newId,
      userId,
      title: titleOverride ?? `${original.title} (副本)`,
      template: original.template,
      themeConfig: normalizeThemeConfig(original.themeConfig),
      language: original.language,
    });

    for (const section of original.sections) {
      await db.insert(resumeSections).values({
        id: crypto.randomUUID(),
        resumeId: newId,
        type: section.type,
        title: section.title,
        sortOrder: section.sortOrder,
        visible: section.visible,
        content: section.content,
      });
    }

    return this.findById(newId);
  },

  // Share operations
  async findByShareToken(token: string) {
    const resume = await db.select().from(resumes).where(eq(resumes.shareToken, token)).limit(1);
    if (!resume[0]) return null;
    const sections = await db.select().from(resumeSections).where(eq(resumeSections.resumeId, resume[0].id)).orderBy(resumeSections.sortOrder);
    return { ...resume[0], themeConfig: normalizeThemeConfig(resume[0].themeConfig), sections };
  },

  async incrementViewCount(id: string) {
    await db.update(resumes).set({ viewCount: sql`${resumes.viewCount} + 1` } as any).where(eq(resumes.id, id));
  },

  async updateShareSettings(id: string, settings: { isPublic?: boolean; shareToken?: string | null; sharePassword?: string | null }) {
    await db.update(resumes).set({ ...settings, updatedAt: new Date() } as any).where(eq(resumes.id, id));
  },

  // Section operations
  async createSection(data: { id?: string; resumeId: string; type: string; title: string; sortOrder: number; visible?: boolean; content?: unknown }) {
    const id = data.id || crypto.randomUUID();
    await db.insert(resumeSections).values({
      id,
      resumeId: data.resumeId,
      type: data.type,
      title: data.title,
      sortOrder: data.sortOrder,
      visible: data.visible ?? true,
      content: data.content || {},
    } as any);
    return db.select().from(resumeSections).where(eq(resumeSections.id, id)).limit(1).then((r: any[]) => r[0]);
  },

  async updateSection(id: string, data: Partial<{ title: string; sortOrder: number; visible: boolean; content: unknown }>) {
    await db.update(resumeSections).set({ ...data, updatedAt: new Date() } as any).where(eq(resumeSections.id, id));
  },

  async deleteSection(id: string) {
    await db.delete(resumeSections).where(eq(resumeSections.id, id));
  },

  async updateSectionOrder(sections: { id: string; sortOrder: number }[]) {
    for (const s of sections) {
      await db.update(resumeSections).set({ sortOrder: s.sortOrder, updatedAt: new Date() }).where(eq(resumeSections.id, s.id));
    }
  },
};
