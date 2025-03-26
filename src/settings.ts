import { Type, type Static } from '@sinclair/typebox';

const pathPatternString = Type.String({
  // for legacy reasions locale can be specified as well
  pattern: '.*\\{languageTag|locale\\}.*\\.(json|hjson|toml)$',
  examples: [
    './messages/{locale}.json',
    './i18n/{locale}.json',
    './messages/{locale}.hjson',
    './messages/{locale}.toml',
  ],
  title: 'Path to language files',
  description:
    'Specify the pathPattern to locate resource files in your repository. It must include `{locale}` and end with `.json`, `.hjson`, or `.toml`.',
});

const pathPatternArray = Type.Array(pathPatternString, {
  title: 'Paths to language files',
  description:
    'Specify multiple pathPatterns to locate resource files in your repository. Each must include `{locale}` and end with `.json`, `.hjson`, or `.toml`.',
});

export type PluginSettings = Static<typeof PluginSettings>;
export const PluginSettings = Type.Object({
  pathPattern: Type.Union([pathPatternString, pathPatternArray]),
});
