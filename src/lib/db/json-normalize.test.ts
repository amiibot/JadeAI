import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeThemeConfig, normalizeUserSettings } from './json-normalize';

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
