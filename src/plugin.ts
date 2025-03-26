import type { InlangPlugin } from '@inlang/sdk';
import { plugin as pluginV2 } from './v2/plugin.js';
import { PluginSettings } from './settings.js';
import { toBeImportedFiles } from './import-export/toBeImportedFiles.js';
import { importFiles } from './import-export/importFiles.js';
import { exportFiles } from './import-export/exportFiles.js';

export const PLUGIN_KEY = 'plugin.inlang.messageFormat.hjson.toml';

export const plugin: InlangPlugin<{
  [PLUGIN_KEY]?: PluginSettings;
}> = {
  key: PLUGIN_KEY,
  // legacy v2 stuff for backwards compatibility
  // given that most people don't have a major version
  // pinning in their settings
  id: pluginV2.id,
  // @ts-expect-error - displayName is not in the v2 plugin
  displayName: pluginV2.displayName,
  // @ts-expect-error - description is not in the v2 plugin
  description: pluginV2.description,
  settingsSchema: PluginSettings,
  toBeImportedFiles,
  importFiles,
  exportFiles,
};
