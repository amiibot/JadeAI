import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeSectionContent, normalizeThemeConfig, normalizeUserSettings } from './json-normalize';

test('normalizeUserSettings parses stringified JSON', () => {
  assert.deepEqual(normalizeUserSettings('{"aiProvider":"openai","autoSave":true,"autoSaveInterval":700}'), {
    aiProvider: 'openai',
    autoSave: true,
    autoSaveInterval: 700,
  });
});

test('normalizeUserSettings drops fragmented string payloads', () => {
  assert.deepEqual(normalizeUserSettings('{"0":"{","1":"}"}'), {});
});

test('normalizeThemeConfig parses stringified JSON and fills defaults', () => {
  const normalized = normalizeThemeConfig('{"primaryColor":"#123456","margin":{"top":10}}');
  assert.equal(normalized.primaryColor, '#123456');
  assert.equal(normalized.accentColor, '#3b82f6');
  assert.equal(normalized.margin.top, 10);
  assert.equal(normalized.margin.right, 20);
});

test('normalizeThemeConfig drops fragmented string payloads', () => {
  const normalized = normalizeThemeConfig('{"0":"{","1":"}"}');
  assert.equal(normalized.primaryColor, '#1a1a1a');
  assert.equal(normalized.avatarStyle, 'oneInch');
});

test('normalizeSectionContent coerces malformed list fields to arrays', () => {
  const normalized = normalizeSectionContent({
    items: 'a lot of text',
    categories: { text: 'oops' },
  });

  assert.deepEqual(normalized.items, []);
  assert.deepEqual(normalized.categories, []);
});

test('normalizeSectionContent repairs nested array fields and missing ids', () => {
  const normalized = normalizeSectionContent({
    items: [
      {
        title: 'Example',
        highlights: 'bad',
        technologies: { name: 'React' },
      },
    ],
    categories: [
      {
        name: 'Frontend',
        skills: 'bad',
      },
    ],
  });

  assert.equal(normalized.items?.[0]?.id, 'item-0');
  assert.deepEqual(normalized.items?.[0]?.highlights, []);
  assert.deepEqual(normalized.items?.[0]?.technologies, []);
  assert.equal(normalized.categories?.[0]?.id, 'category-0');
  assert.deepEqual(normalized.categories?.[0]?.skills, []);
});
