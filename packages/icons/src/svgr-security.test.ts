import { describe, expect, it, vi } from 'vitest';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, resolve, join } from 'node:path';
import {
  mkdtempSync,
  writeFileSync,
  rmSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  existsSync,
  symlinkSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import process from 'node:process';
import * as ts from 'typescript';
import { isValidElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'node:fs';

const root = process.cwd();
const require = createRequire(resolve(root, 'package.json'));
const cli = resolve(
  dirname(require.resolve('@svgr/cli/package.json')),
  'bin/svgr',
);
const config = resolve(root, 'svgr.config.js');
const sources = [
  '<svg><script>inert fixture</script></svg>',
  '<svg><foreignObject /></svg>',
  '<svg onload="inert" />',
  '<svg><image href="https://fixture.invalid/image" /></svg>',
  '<!DOCTYPE svg [<!ENTITY harmless "fixture">]><svg />',
  '<svg xmlns="urn:fixture" />',
  '<svg xmlns:x="urn:fixture"><x:path /></svg>',
  '<svg><title>${INERT_MARKER}</title></svg>',
];

describe('SVGR direct config boundary', () => {
  it.each(sources)(
    'rejects unsupported source before optimization: %s',
    (source) => {
      const fixture = mkdtempSync(join(tmpdir(), 'svgr-boundary-'));
      try {
        const input = join(fixture, 'fixture.svg');
        writeFileSync(input, source);
        const result = spawnSync(
          process.execPath,
          [
            cli,
            '--config-file',
            config,
            '--out-dir',
            join(fixture, 'output'),
            input,
          ],
          {
            cwd: root,
            encoding: 'utf8',
          },
        );
        expect(result.status).not.toBe(0);
      } finally {
        rmSync(fixture, { recursive: true, force: true });
      }
    },
  );
});

it('accepts committed static corpus and preserves public exports and registrations', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'svgr-corpus-'));
  try {
    const output = join(fixture, 'generated');
    const build: unknown = require('./scripts/build-icons');
    if (
      !build ||
      typeof build !== 'object' ||
      !('buildIcons' in build) ||
      typeof build.buildIcons !== 'function'
    )
      throw new Error('Invalid generator module');
    build.buildIcons(join(root, 'svg'), output);
    const names = [
      'IconChatBubble',
      'IconEye',
      'IconEyeOff',
      'IconCheck',
      'IconSparkle',
    ];
    const index = readFileSync(join(output, 'index.ts'), 'utf8');
    expect(
      Array.from(
        index.matchAll(/default as ([A-Za-z]+)/g),
        (match) => match[1],
      ),
    ).toEqual(names);
    const registry = readFileSync(join(output, 'registry.ts'), 'utf8');
    expect(
      Array.from(
        registry.matchAll(/register\('([^']+)', ([A-Za-z]+)\)/g),
        (match) => [match[1], match[2]],
      ),
    ).toEqual([
      ['chat-bubble', 'IconChatBubble'],
      ['eye', 'IconEye'],
      ['eye-off', 'IconEyeOff'],
      ['icon-check', 'IconCheck'],
      ['sparkle', 'IconSparkle'],
    ]);
    expect(
      readdirSync(output)
        .filter((file) => file.endsWith('.tsx'))
        .sort(),
    ).toEqual([
      'ChatBubble.tsx',
      'Eye.tsx',
      'EyeOff.tsx',
      'IconCheck.tsx',
      'Sparkle.tsx',
    ]);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

it('direct index generator cannot bypass source validation', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'svgr-index-'));
  try {
    const input = join(fixture, 'svg');
    mkdirSync(input);
    writeFileSync(join(input, 'unsafe.svg'), '<svg onload="inert" />');
    const result = spawnSync(
      process.execPath,
      [join(root, 'scripts/generate-index.js'), input, join(fixture, 'output')],
      { cwd: root, encoding: 'utf8' },
    );
    expect(result.status).not.toBe(0);
    expect(existsSync(join(fixture, 'output'))).toBe(false);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

it('validates bounded files, collisions and output before replacement', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'svgr-invalid-'));
  try {
    const input = join(fixture, 'svg');
    mkdirSync(input);
    const build: unknown = require('./scripts/build-icons');
    if (
      !build ||
      typeof build !== 'object' ||
      !('buildIcons' in build) ||
      typeof build.buildIcons !== 'function' ||
      !('run' in build) ||
      typeof build.run !== 'function'
    )
      throw new Error('Invalid generator');
    const generate = build.buildIcons;
    expect(() => generate(input, input)).toThrow('separate');
    expect(() => generate(input, join(input, 'output'))).toThrow('separate');
    expect(() => generate(input, fixture)).toThrow('separate');
    const alias = join(fixture, 'alias');
    symlinkSync(input, alias);
    expect(() => generate(alias, input)).toThrow('separate');
    expect(() => generate(input, join(alias, 'nested'))).toThrow('separate');
    rmSync(alias);
    expect(() => generate(input, join(fixture, 'output'))).toThrow('No .svg');
    writeFileSync(join(input, 'safe-icon.svg'), '<svg />');
    writeFileSync(join(input, 'safe_icon.svg'), '<svg />');
    expect(() => generate(input, join(fixture, 'output'))).toThrow('duplicate');
    rmSync(join(input, 'safe_icon.svg'));
    const output = join(fixture, 'output');
    writeFileSync(output, 'preserve');
    expect(() => generate(input, output)).toThrow('regular directory');
    rmSync(output);
    symlinkSync(input, output);
    expect(() => generate(input, output)).toThrow('regular directory');
    rmSync(output);
    symlinkSync(join(input, 'safe-icon.svg'), join(input, 'symlink.svg'));
    expect(() => generate(input, output)).toThrow('regular file');
    rmSync(join(input, 'symlink.svg'));
    writeFileSync(join(input, 'oversized.svg'), ' '.repeat(1024 * 1024 + 1));
    expect(() => generate(input, output)).toThrow('1 MiB');
    expect(build.run(['--help'])).toBe(0);
    expect(build.run(['a', 'b', 'c'])).toBe(1);
    expect(build.run([input, output])).toBe(1);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

it('validates direct plugin input and renders generated modules inertly', () => {
  const validator: unknown = require('./scripts/validate-svg');
  if (typeof validator !== 'function') throw new Error('Invalid validator');
  for (const source of sources) expect(() => validator(source)).toThrow();
  const fixture = mkdtempSync(join(tmpdir(), 'svgr-render-'));
  try {
    const input = join(fixture, 'svg');
    mkdirSync(input);
    const source =
      '<svg viewBox="0 0 24 24"><title>&lt;script&gt;inert ` marker&lt;/script&gt;</title><path d="M0 0h10v10H0z" /></svg>';
    expect(validator(source)).toBe(source);
    writeFileSync(join(input, 'safe-icon.svg'), source);
    const output = join(fixture, 'generated');
    const result = spawnSync(
      process.execPath,
      [join(root, 'scripts/build-icons.js'), input, output],
      { cwd: root, encoding: 'utf8' },
    );
    expect(result.status).toBe(0);
    const code = readFileSync(join(output, 'SafeIcon.tsx'), 'utf8');
    const compiled = ts.transpileModule(code, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.React,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText;
    const mod = { exports: {} };
    new Function('require', 'module', 'exports', compiled)(
      require,
      mod,
      mod.exports,
    );
    const component: unknown = mod.exports;
    if (
      !component ||
      typeof component !== 'object' ||
      !('default' in component) ||
      typeof component.default !== 'function'
    )
      throw new Error('No generated component');
    const element: unknown = component.default({});
    if (!isValidElement(element)) throw new Error('No React SVG');
    const html = renderToStaticMarkup(element);
    expect(html).toContain('<svg');
    expect(html).toContain('<path');
    expect(html).not.toMatch(/<script|foreignObject|onload|https:\/\/fixture/i);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

it('replaces complete batches and restores previous output on filesystem failure', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'svgr-replace-'));
  const savedExecPath = process.execPath;
  try {
    const input = join(fixture, 'svg');
    mkdirSync(input);
    writeFileSync(
      join(input, 'safe.svg'),
      '<svg><path d="M0 0h10v10H0z" /></svg>',
    );
    const output = join(fixture, 'generated');
    mkdirSync(output);
    writeFileSync(join(output, 'previous.tsx'), 'preserve this');
    const build: unknown = require('./scripts/build-icons');
    if (
      !build ||
      typeof build !== 'object' ||
      !('buildIcons' in build) ||
      typeof build.buildIcons !== 'function' ||
      !('run' in build) ||
      typeof build.run !== 'function'
    )
      throw new Error('Invalid generator');
    const generate = build.buildIcons;
    process.execPath = join(fixture, 'missing-node');
    expect(() => generate(input, output)).toThrow('generation failed');
    expect(readFileSync(join(output, 'previous.tsx'), 'utf8')).toBe(
      'preserve this',
    );
    process.execPath = savedExecPath;
    const rename = fs.renameSync;
    const mock = vi.spyOn(fs, 'renameSync').mockImplementation((from, to) => {
      if (
        String(from).endsWith('/generated') &&
        String(from).includes('.svgr-build-')
      )
        throw new Error('inert rename failure');
      return rename(from, to);
    });
    try {
      expect(() => generate(input, output)).toThrow('inert rename failure');
      expect(readFileSync(join(output, 'previous.tsx'), 'utf8')).toBe(
        'preserve this',
      );
    } finally {
      mock.mockRestore();
    }
    expect(build.run([input, output])).toBe(0);
    expect(readdirSync(output).sort()).toEqual([
      'Safe.tsx',
      'index.ts',
      'registry.ts',
    ]);
    const adapter: unknown = require('./scripts/generate-index');
    expect(adapter).toMatchObject({ run: build.run });
  } finally {
    process.execPath = savedExecPath;
    vi.restoreAllMocks();
    rmSync(fixture, { recursive: true, force: true });
  }
});

it.each(sources)(
  'validates the complete batch through build:icons and preserves previous output: %s',
  (source) => {
    const fixture = mkdtempSync(join(tmpdir(), 'svgr-batch-'));
    try {
      const input = join(fixture, 'svg');
      const output = join(fixture, 'generated');
      mkdirSync(input);
      mkdirSync(output);
      writeFileSync(
        join(input, 'a-safe.svg'),
        '<svg><path d="M0 0h10v10H0z" /></svg>',
      );
      writeFileSync(join(input, 'z-invalid.svg'), source);
      writeFileSync(join(output, 'previous.tsx'), 'preserve this exact output');
      const result = spawnSync(
        'corepack',
        ['pnpm', 'build:icons', input, output],
        { cwd: root, encoding: 'utf8' },
      );
      expect(result.status).not.toBe(0);
      expect(readdirSync(output)).toEqual(['previous.tsx']);
      expect(readFileSync(join(output, 'previous.tsx'), 'utf8')).toBe(
        'preserve this exact output',
      );
      expect(
        readdirSync(fixture).filter((file) => file.startsWith('.svgr-build-')),
      ).toEqual([]);
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  },
);

it('keeps the strict validator first in the direct SVGR configuration', () => {
  const configured: unknown = require('./svgr.config');
  const validator: unknown = require('./scripts/validate-svg');
  if (
    !configured ||
    typeof configured !== 'object' ||
    !('plugins' in configured) ||
    !Array.isArray(configured.plugins)
  )
    throw new Error('Invalid SVGR config');
  expect(configured.plugins[0]).toBe(validator);
  expect(configured.plugins.slice(1)).toEqual([
    '@svgr/plugin-svgo',
    '@svgr/plugin-jsx',
    '@svgr/plugin-prettier',
  ]);
});
