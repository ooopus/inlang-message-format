import { test, expect } from 'vitest';
import { toBeImportedFiles } from './toBeImportedFiles.js';

test('toBeImportedFiles should work with locale as setting', async () => {
  const result = await toBeImportedFiles({
    settings: {
      baseLocale: 'en',
      locales: ['en', 'de'],
      'plugin.inlang.messageFormat.hjson.toml': {
        pathPattern: '/translations/{locale}.json',
      },
    },
  });

  expect(result).toEqual([
    {
      locale: 'en',
      path: '/translations/en.json',
    },
    {
      locale: 'de',
      path: '/translations/de.json',
    },
  ]);
});

test('toBeImportedFiles returns [] if the pathPattern is not provided', async () => {
  const result = await toBeImportedFiles({
    nodeFs: {} as any,
    settings: {
      baseLocale: 'en',
      locales: ['en', 'de'],
      'plugin.inlang.messageFormat.hjson.toml': {
        // @ts-expect-error - testing defined plugin settings without pathPattern
        'some-other-prop': 'value',
        // pathPattern: "/translations/{locale}.json",
      },
    },
  });

  expect(result).toEqual([]);
});

test('toBeImportedFiles should work with languageTag as setting for backward compatibility', async () => {
  const result = await toBeImportedFiles({
    settings: {
      baseLocale: 'en',
      locales: ['en', 'de'],
      'plugin.inlang.messageFormat.hjson.toml': {
        pathPattern: '/translations/{languageTag}.json',
      },
    },
  });

  expect(result).toEqual([
    {
      locale: 'en',
      path: '/translations/en.json',
    },
    {
      locale: 'de',
      path: '/translations/de.json',
    },
  ]);
});

test('toBeImportedFiles should work with both locale and languageTag and multiple pathPatterns', async () => {
  const result = await toBeImportedFiles({
    settings: {
      baseLocale: 'en',
      locales: ['en', 'de'],
      'plugin.inlang.messageFormat.hjson.toml': {
        pathPattern: ['/defaults/{locale}.json', '/translations/{locale}.json'],
      },
    },
  });

  expect(result).toEqual([
    {
      locale: 'en',
      path: '/defaults/en.json',
    },
    {
      locale: 'de',
      path: '/defaults/de.json',
    },
    {
      locale: 'en',
      path: '/translations/en.json',
    },
    {
      locale: 'de',
      path: '/translations/de.json',
    },
  ]);
});

test('toBeImportedFiles should work with HJSON format', async () => {
  const result = await toBeImportedFiles({
    settings: {
      baseLocale: 'en',
      locales: ['en', 'de'],
      'plugin.inlang.messageFormat.hjson.toml': {
        pathPattern: '/translations/{locale}.hjson',
      },
    },
  });

  expect(result).toEqual([
    {
      locale: 'en',
      path: '/translations/en.hjson',
    },
    {
      locale: 'de',
      path: '/translations/de.hjson',
    },
  ]);
});

test('toBeImportedFiles should work with TOML format', async () => {
  const result = await toBeImportedFiles({
    settings: {
      baseLocale: 'en',
      locales: ['en', 'de'],
      'plugin.inlang.messageFormat.hjson.toml': {
        pathPattern: '/translations/{locale}.toml',
      },
    },
  });

  expect(result).toEqual([
    {
      locale: 'en',
      path: '/translations/en.toml',
    },
    {
      locale: 'de',
      path: '/translations/de.toml',
    },
  ]);
});

test('toBeImportedFiles should work with mixed format patterns', async () => {
  const result = await toBeImportedFiles({
    settings: {
      baseLocale: 'en',
      locales: ['en', 'de'],
      'plugin.inlang.messageFormat.hjson.toml': {
        pathPattern: [
          '/defaults/{locale}.json',
          '/translations/{locale}.hjson',
          '/custom/{locale}.toml',
        ],
      },
    },
  });

  expect(result).toEqual([
    {
      locale: 'en',
      path: '/defaults/en.json',
    },
    {
      locale: 'de',
      path: '/defaults/de.json',
    },
    {
      locale: 'en',
      path: '/translations/en.hjson',
    },
    {
      locale: 'de',
      path: '/translations/de.hjson',
    },
    {
      locale: 'en',
      path: '/custom/en.toml',
    },
    {
      locale: 'de',
      path: '/custom/de.toml',
    },
  ]);
});
