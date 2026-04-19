import type { ThemeConfig } from '@/types/resume';

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
