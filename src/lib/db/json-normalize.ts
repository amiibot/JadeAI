import type { ResumeSection, ResumeSectionItem, ResumeSkillCategory, ThemeConfig } from '@/types/resume';

type NormalizedSectionContent = ResumeSection['content'];

const DEFAULT_THEME: ThemeConfig = {
  primaryColor: '#1a1a1a',
  accentColor: '#3b82f6',
  fontFamily: 'Inter',
  fontSize: 'medium',
  lineSpacing: 1.5,
  margin: { top: 20, right: 20, bottom: 20, left: 20 },
  sectionSpacing: 16,
  avatarStyle: 'oneInch',
};

export type UserSettings = {
  aiProvider?: string;
  aiBaseURL?: string;
  aiModel?: string;
  autoSave?: boolean;
  autoSaveInterval?: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseMaybeJson(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

export function normalizeUserSettings(value: unknown): UserSettings {
  const source = parseMaybeJson(value);
  if (!isRecord(source)) return {};

  const normalized: UserSettings = {};
  if (typeof source.aiProvider === 'string') normalized.aiProvider = source.aiProvider;
  if (typeof source.aiBaseURL === 'string') normalized.aiBaseURL = source.aiBaseURL;
  if (typeof source.aiModel === 'string') normalized.aiModel = source.aiModel;
  if (typeof source.autoSave === 'boolean') normalized.autoSave = source.autoSave;
  if (typeof source.autoSaveInterval === 'number') normalized.autoSaveInterval = source.autoSaveInterval;
  return normalized;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function normalizeSectionItem(item: unknown, index: number): ResumeSectionItem {
  if (!isRecord(item)) {
    return { id: `item-${index}` };
  }

  const normalized: ResumeSectionItem = {
    ...item,
    id: typeof item.id === 'string' && item.id.trim() ? item.id : `item-${index}`,
  };

  if ('highlights' in item) normalized.highlights = toStringArray(item.highlights);
  if ('technologies' in item) normalized.technologies = toStringArray(item.technologies);
  if ('skills' in item) normalized.skills = toStringArray(item.skills);

  return normalized;
}

function normalizeSkillCategory(item: unknown, index: number): ResumeSkillCategory {
  if (!isRecord(item)) {
    return { id: `category-${index}`, name: '', skills: [] };
  }

  return {
    ...item,
    id: typeof item.id === 'string' && item.id.trim() ? item.id : `category-${index}`,
    name: typeof item.name === 'string' ? item.name : '',
    skills: toStringArray(item.skills),
  };
}

export function normalizeSectionContent(value: unknown): NormalizedSectionContent {
  const source = parseMaybeJson(value);
  if (!isRecord(source)) return {} as unknown as NormalizedSectionContent;

  const normalized: Record<string, unknown> = { ...source };

  if ('items' in source) {
    normalized.items = Array.isArray(source.items)
      ? source.items.map((item, index) => normalizeSectionItem(item, index))
      : [];
  }

  if ('categories' in source) {
    normalized.categories = Array.isArray(source.categories)
      ? source.categories.map((category, index) => normalizeSkillCategory(category, index))
      : [];
  }

  return normalized as unknown as NormalizedSectionContent;
}

export function normalizeResumeSections<T extends { content: unknown }>(sections: T[]): T[] {
  return sections.map((section) => ({
    ...section,
    content: normalizeSectionContent(section.content) as T['content'],
  })) as T[];
}

export function normalizeThemeConfig(value: unknown): ThemeConfig {
  const source = parseMaybeJson(value);
  if (!isRecord(source)) return { ...DEFAULT_THEME };

  const margin = isRecord(source.margin) ? source.margin : {};
  return {
    ...DEFAULT_THEME,
    ...(typeof source.primaryColor === 'string' && { primaryColor: source.primaryColor }),
    ...(typeof source.accentColor === 'string' && { accentColor: source.accentColor }),
    ...(typeof source.fontFamily === 'string' && { fontFamily: source.fontFamily }),
    ...(typeof source.fontSize === 'string' && { fontSize: source.fontSize }),
    ...(typeof source.lineSpacing === 'number' && { lineSpacing: source.lineSpacing }),
    ...(typeof source.sectionSpacing === 'number' && { sectionSpacing: source.sectionSpacing }),
    ...(typeof source.avatarStyle === 'string' && { avatarStyle: source.avatarStyle === 'circle' ? 'circle' : 'oneInch' }),
    margin: {
      top: typeof margin.top === 'number' ? margin.top : DEFAULT_THEME.margin.top,
      right: typeof margin.right === 'number' ? margin.right : DEFAULT_THEME.margin.right,
      bottom: typeof margin.bottom === 'number' ? margin.bottom : DEFAULT_THEME.margin.bottom,
      left: typeof margin.left === 'number' ? margin.left : DEFAULT_THEME.margin.left,
    },
  };
}
