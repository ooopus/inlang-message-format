import type {
  Bundle,
  Declaration,
  ExportFile,
  Match,
  Message,
  VariableReference,
  Variant,
} from '@inlang/sdk';
import { PLUGIN_KEY, type plugin } from '../plugin.js';
import type {
  ComplexMessage,
  FileSchema,
  SimpleMessage,
} from '../fileSchema.js';
import { unflatten } from 'flat';
import hjson from 'hjson-ts';
import * as toml from 'smol-toml';

export const exportFiles: NonNullable<(typeof plugin)['exportFiles']> = async ({
  bundles,
  messages,
  variants,
  settings,
}: {
  bundles: Bundle[];
  messages: Message[];
  variants: Variant[];
  settings: Record<string, any>;
}) => {
  const files: Record<string, FileSchema> = {};

  for (const message of messages) {
    const bundle = bundles.find((b) => b.id === message.bundleId);
    const variantsOfMessage = [
      ...variants
        .reduce((r, v) => {
          if (v.messageId === message.id) r.set(JSON.stringify(v.matches), v);
          return r;
        }, new Map<string, (typeof variants)[number]>())
        .values(),
    ];
    files[message.locale] = {
      ...files[message.locale],
      ...serializeMessage(bundle!, message, variantsOfMessage),
    };
  }

  const result: ExportFile[] = [];

  for (const locale in files) {
    // 获取文件扩展名，默认为.json
    const fileExtension = settings?.[PLUGIN_KEY]?.pathPattern
      ? Array.isArray(settings[PLUGIN_KEY].pathPattern)
        ? settings[PLUGIN_KEY].pathPattern.some((pattern: string) =>
            pattern.endsWith('.toml')
          )
          ? '.toml'
          : settings[PLUGIN_KEY].pathPattern.some((pattern: string) =>
                pattern.endsWith('.hjson')
              )
            ? '.hjson'
            : '.json'
        : settings[PLUGIN_KEY].pathPattern.endsWith('.toml')
          ? '.toml'
          : settings[PLUGIN_KEY].pathPattern.endsWith('.hjson')
            ? '.hjson'
            : '.json'
      : '.json';

    const unflattened = unflatten({
      // increase DX by providing auto complete in IDEs
      $schema: 'https://inlang.com/schema/inlang-message-format',
      ...files[locale],
    });

    let content;
    if (fileExtension === '.hjson') {
      // 使用HJSON格式化
      content = new TextEncoder().encode(hjson.stringify(unflattened));
    } else if (fileExtension === '.toml') {
      // 使用TOML格式化
      content = new TextEncoder().encode(toml.stringify(unflattened));
    } else {
      // 使用JSON格式化
      content = new TextEncoder().encode(
        JSON.stringify(unflattened, undefined, '\t')
      );
    }

    result.push({
      locale,
      content,
      name: locale + fileExtension,
    });
  }

  return result;
};

function serializeMessage(
  bundle: Bundle,
  message: Message,
  variants: Variant[]
): Record<string, SimpleMessage | ComplexMessage> {
  const key = message.bundleId;
  const value = serializeVariants(bundle, message, variants);
  return { [key]: value };
}

function serializeVariants(
  bundle: Bundle,
  message: Message,
  variants: Variant[]
): SimpleMessage | ComplexMessage {
  // single variant
  if (variants.length === 1) {
    if (
      message.selectors.length === 0 &&
      bundle.declarations.some((d) => d.type !== 'input-variable') === false
    ) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return serializePattern(variants[0]!.pattern);
    }
  }

  const entries: [string, string][] = [];
  for (const variant of variants) {
    if (variant.matches.length === 0) {
      for (const part of variant.pattern) {
        if (
          part.type === 'expression' &&
          part.arg.type === 'variable-reference'
        ) {
          variant.matches.push({ key: part.arg.name, type: 'catchall-match' });
        }
      }
    }

    const pattern = serializePattern(variant.pattern);
    const match = serializeMatcher(variant.matches);
    entries.push([match, pattern]); // 直接使用外部的 entries 数组
  }

  return [
    {
      // naively adding all declarations, even if unused in the variants
      // can be optimized later.
      declarations: bundle.declarations
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(serializeDeclaration)
        .sort(),
      selectors: message.selectors.map((s) => s.name).sort(),
      match: Object.fromEntries(entries),
    },
  ];
}

function serializePattern(pattern: Variant['pattern']): string {
  let result = '';

  for (const part of pattern) {
    if (part.type === 'text') {
      result += part.value;
    } else if (part.arg.type === 'variable-reference') {
      result += `{${part.arg.name}}`;
    } else {
      throw new Error('Unsupported expression type');
    }
  }
  return result;
}

// input: { platform: "android", userGender: "male" }
// output: `platform=android,userGender=male`
function serializeMatcher(matches: Match[]): string {
  const parts = matches
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((match) =>
      match.type === 'literal-match'
        ? `${match.key}=${match.value}`
        : `${match.key}=*`
    );

  return parts.join(', ');
}

function serializeDeclaration(declaration: Declaration): string {
  if (declaration.type === 'input-variable') {
    return `input ${declaration.name}`;
  } else if (declaration.type === 'local-variable') {
    let result = '';
    if (declaration.value.arg.type === 'variable-reference') {
      result = `local ${declaration.name} = ${declaration.value.arg.name}`;
    } else if (declaration.value.arg.type === 'literal') {
      result = `local ${declaration.name} = "${declaration.value.arg.value}"`;
    }
    if (declaration.value.annotation) {
      result += `: ${declaration.value.annotation.name}`;
    }
    if (declaration.value.annotation?.options) {
      for (const option of declaration.value?.annotation?.options ?? []) {
        if (option.value.type !== 'literal') {
          throw new Error('Unsupported option type');
        }
        result += ` ${option.name}=${option.value.value}`;
      }
    }
    return result;
  }
  throw new Error('Unsupported declaration type');
}
