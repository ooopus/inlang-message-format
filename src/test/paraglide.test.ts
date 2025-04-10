import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

describe('Paraglide JS Compilation Tests', () => {
  const outDir = join(__dirname, '../../example/out');
  const messagesDir = join(outDir, 'messages');
  const distDir = join(__dirname, '../../dist');

  it('should successfully compile multilingual files', { timeout: 10000 }, async () => {
    // Execute compilation command
    const command =
      'pnpm dlx @inlang/paraglide-js compile --project ./example/project.inlang --outdir ./example/out/';
    expect(() => execSync(command, { stdio: 'pipe' })).not.toThrow();

    // Verify output directory exists
    expect(existsSync(outDir)).toBe(true);
    expect(existsSync(messagesDir)).toBe(true);

    // Expected output files
    const expectedFiles = [
      join(messagesDir, 'from.js'),
      join(messagesDir, 'blue_horse_shoe.js'),
      join(messagesDir, 'jojo_mountain_day_match_platform____usergender__.js'),
      join(
        messagesDir,
        'jojo_mountain_day_match_platform_android__usergender_male.js'
      ),
      join(
        messagesDir,
        'jojo_mountain_day_match_platform_ios__usergender_female.js'
      ),
      join(messagesDir, 'some_happy_cat.js'),
    ];

    // Add debug information
    for (const file of expectedFiles) {
      const dir = join(file, '..');
      const files = existsSync(dir) ? execSync(`ls ${dir}`).toString().split('\n') : [];
      const exists = files.some(f => f.includes(file.split('/').pop()!.replace('.js', '')));
      
      if (!exists) {
        console.log(`File containing pattern does not exist: ${file}`);
        console.log(`Directory contents ${dir}:`, files);
        expect(exists, `File containing pattern does not exist: ${file}`).toBe(true);
      }
    }

    // Verify message file content
    const messagesContent = readFileSync(join(outDir, 'messages.js'), 'utf-8');
    expect(messagesContent).toContain("export * from './messages/_index.js'");
    expect(messagesContent).toContain(
      "export * as m from './messages/_index.js'"
    );

    // Verify index file content
    const indexContent = readFileSync(join(messagesDir, '_index.js'), 'utf-8');
    expect(indexContent).toContain('some_happy_cat');
    expect(indexContent).toContain('blue_horse_shoe');
    expect(indexContent).toContain('jojo_mountain_day');
  });
});
