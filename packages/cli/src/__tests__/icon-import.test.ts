import { afterEach, describe, expect, it, vi } from 'vitest';
import { spawnSync } from 'node:child_process';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
  renameSync,
  symlinkSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { isValidElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import {
  parseSvg,
  renderComponent,
  readSvgDirectory,
} from '../../bin/lib/svg-import';
import { importIcons, run as runImporter } from '../../bin/lumia-icon-import';

const localRequire = createRequire(import.meta.url);

const temporaryRoots: string[] = [];
const importer = path.resolve('bin/lumia-icon-import.js');

function fixture(svg: string) {
  const root = mkdtempSync(path.join(tmpdir(), 'sec004-icons-'));
  temporaryRoots.push(root);
  const source = path.join(root, 'source');
  const output = path.join(root, 'icons');
  mkdirSync(source);
  writeFileSync(path.join(source, 'probe.svg'), svg);
  return { root, source, output };
}

function run(source: string, output: string) {
  return spawnSync(process.execPath, [importer, source, output], {
    encoding: 'utf8',
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  temporaryRoots.forEach((root) =>
    rmSync(root, { recursive: true, force: true }),
  );
  temporaryRoots.length = 0;
});

describe('untrusted SVG import boundary', () => {
  it.each([
    '<svg><title>${40 + 2}</title></svg>',
    '<svg><path onload="void 0" d="M0 0" /></svg>',
    '<svg><script>void 0</script></svg>',
    '<svg><foreignObject><div>example</div></foreignObject></svg>',
    '<svg><path fill="url(https://example.invalid/image)" /></svg>',
    '<svg><image href="data:image/svg+xml,example" /></svg>',
    '<svg><style>path { fill: red }</style></svg>',
    '<svg><path style="fill:red" /></svg>',
    '<svg><animate attributeName="href" /></svg>',
    '<!DOCTYPE svg [<!ENTITY marker "example">]><svg><title>&marker;</title></svg>',
    '<svg><title>&#36;{40 + 2}</title></svg>',
    '<svg><path></svg>',
  ])(
    'rejects unsafe or malformed SVG before replacing generated output: %s',
    (svg) => {
      const { source, output } = fixture(svg);
      const existing = path.join(output, 'src/generated/icons');
      mkdirSync(existing, { recursive: true });
      writeFileSync(path.join(existing, 'ExistingIcon.tsx'), 'existing output');
      const result = run(source, output);
      expect(result.status).not.toBe(0);
      expect(
        readFileSync(path.join(existing, 'ExistingIcon.tsx'), 'utf8'),
      ).toBe('existing output');
    },
  );

  it('generates static JSX with escaped attributes and text, without a raw HTML sink', () => {
    const { source, output } = fixture(
      `<svg viewBox="0 0 24 24" aria-label="a&apos;b\\c"><title>&lt;example&gt; \u0060 quote</title><path d="M0 0" stroke="currentColor" /></svg>`,
    );
    const result = run(source, output);
    expect(result.status, result.stderr).toBe(0);
    const generated = readFileSync(
      path.join(output, 'src/generated/icons/ProbeIcon.tsx'),
      'utf8',
    );
    expect(generated).not.toContain('dangerouslySetInnerHTML');
    expect(generated).not.toContain('const svgMarkup = `');
    expect(generated).toContain(JSON.stringify("a'b\\c"));
    expect(generated).toContain(JSON.stringify('<example> ` quote'));
  });
});

describe('static SVG parser and serialization', () => {
  it.each([
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g transform="translate(1 2)"><path d="M0 0 L5 5" fill="none" stroke="currentColor" stroke-width="2" /></g></svg>',
    '<svg><defs><linearGradient id="paint"><stop offset="0%" stop-color="#fff" /><stop offset="100%" stop-color="rgb(0, 0, 0)" /></linearGradient><radialGradient id="radial"><stop stop-color="hsl(0, 10%, 20%)" /></radialGradient><clipPath id="clip"><circle r="2" /></clipPath><mask id="mask"><rect width="5" height="5" /></mask></defs><rect fill="url(#paint)" clip-path="url(#clip)" mask="url(#mask)" /></svg>',
    '<?xml version="1.0" encoding="utf-8"?><svg><!-- inert metadata --><title><![CDATA[hello <world>]]></title><desc>A &amp; B</desc></svg>',
    '<svg><ellipse rx="2" ry="1" /><line x1="0" y1="0" x2="5" y2="5" /><polyline points="0,0 1,1" /><polygon points="0,0 1,1 2,0" /></svg>',
  ])('accepts and serializes supported static artwork', (svg) => {
    const tree = parseSvg(svg);
    expect(tree.attributes.xmlns).toBe('http://www.w3.org/2000/svg');
    expect(tree.attributes.viewBox).toBe('0 0 24 24');
    expect(renderComponent('FixtureIcon', tree)).not.toContain(
      'dangerouslySetInnerHTML',
    );
  });

  it.each([
    '<svg onload="void 0" />',
    '<svg><path href="#other" /></svg>',
    '<svg xmlns:xlink="http://www.w3.org/1999/xlink"><path xlink:href="#other" /></svg>',
    '<svg xmlns="http://www.w3.org/1999/xhtml" />',
    '<s:svg xmlns:s="http://www.w3.org/2000/svg" />',
    '<svg><path xmlns="http://www.w3.org/1999/xhtml" /></svg>',
    '<svg xml:base="https://example.invalid/" />',
    '<?xml-stylesheet href="https://example.invalid/style.css"?><svg />',
    '<svg><g fill="url(javascript:void(0))" /></svg>',
    '<svg><path stroke="url(data:image/svg+xml,example)" /></svg>',
    '<svg><path clip-path="url(https://example.invalid/clip)" /></svg>',
    '<svg><path mask="url(//example.invalid/mask)" /></svg>',
    '<svg><path fill="url(&#x68;ttps://example.invalid/fill)" /></svg>',
    '<svg><path fill="uRl(#paint)" /></svg>',
    '<svg><path filter="url(#filter)" /></svg>',
    '<svg><use href="#path" /></svg>',
    '<svg><a href="https://example.invalid" /></svg>',
    '<svg><set attributeName="fill" to="red" /></svg>',
    '<svg><title>&unknown;</title></svg>',
    '<svg id="invalid space" />',
    '<svg aria-label="&#36;{40+2}" />',
    '<svg><title><![CDATA[${40+2}]]></title></svg>',
    '<svg><title>text</title><svg /></svg>',
    '<path />',
    '<svg /> <svg />',
    '<svg>unsupported text</svg>',
    '<svg viewBox="1" viewBox="2" />',
    '<svg><path></g></svg>',
    '<svg><path/>',
    '<svg',
    '',
  ])('rejects active, ambiguous, or malformed input', (svg) => {
    expect(() => parseSvg(svg)).toThrow();
  });

  it('bounds source bytes, depth, elements, and attributes', () => {
    expect(() => parseSvg('<svg />' + ' '.repeat(1024 * 1024))).toThrow(
      '1 MiB',
    );
    expect(() =>
      parseSvg('<svg>' + '<g>'.repeat(32) + '</g>'.repeat(32) + '</svg>'),
    ).toThrow('complexity');
    expect(() =>
      parseSvg('<svg>' + '<circle />'.repeat(4096) + '</svg>'),
    ).toThrow('complexity');
    expect(() =>
      parseSvg(
        '<svg ' +
          Array.from({ length: 65 }, (_, n) => `a${n}="1"`).join(' ') +
          '/>',
      ),
    ).toThrow('attributes');
    expect(() => parseSvg(`<svg aria-label="${'a'.repeat(16385)}" />`)).toThrow(
      'attribute',
    );
  });

  it('evaluates generated modules and renders escaped SVG text through React', () => {
    const source = renderComponent(
      'ProbeIcon',
      parseSvg(
        '<svg aria-label="a&apos;b\\c" class="example"><title>&lt;script&gt;void 0&lt;/script&gt; ` "</title><path fill="currentColor" d="M0 0" /></svg>',
      ),
    );
    const compiled = ts.transpileModule(source, {
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    });
    const component: unknown = runInNewContext(
      compiled.outputText + '\nexports.ProbeIcon;',
      { exports: {}, require: localRequire },
    );
    expect(typeof component).toBe('function');
    if (typeof component !== 'function')
      throw new Error('Missing generated component');
    const element: unknown = component({ 'aria-hidden': true });
    if (!isValidElement(element)) throw new Error('Invalid generated element');
    const html = renderToStaticMarkup(element);
    expect(html).toContain('class="example"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('&lt;script&gt;void 0&lt;/script&gt;');
    expect(html).not.toContain('<script>');
    expect(html).toContain('<path');
  });
});

describe('batch import and executable contract', () => {
  it('imports the existing committed SVG corpus with stable registrations', () => {
    const { output } = fixture('<svg />');
    vi.spyOn(console, 'log').mockImplementation(() => {});
    importIcons(path.resolve('../icons/svg'), output);
    expect(
      readFileSync(path.join(output, 'src/generated/registry.ts'), 'utf8'),
    ).toContain('registerIcon("icon-check", IconCheckIcon)');
    expect(
      readFileSync(path.join(output, 'src/generated/index.ts'), 'utf8'),
    ).toContain('ChatBubbleIcon');
  });

  it('prevalidates every file and name before deleting any output', () => {
    const { source, output } = fixture('<svg />');
    vi.spyOn(console, 'log').mockImplementation(() => {});
    importIcons(source, output);
    const existing = path.join(output, 'src/generated/icons/ProbeIcon.tsx');
    const before = readFileSync(existing, 'utf8');
    writeFileSync(path.join(source, 'z-invalid.svg'), '<svg><script /></svg>');
    expect(() => importIcons(source, output)).toThrow();
    expect(readFileSync(existing, 'utf8')).toBe(before);
    rmSync(path.join(source, 'z-invalid.svg'));
    writeFileSync(path.join(source, 'other-icon.svg'), '<svg />');
    writeFileSync(path.join(source, 'other_icon.svg'), '<svg />');
    expect(() => importIcons(source, output)).toThrow('duplicate');
    expect(readFileSync(existing, 'utf8')).toBe(before);
  });

  it('supports digit prefixes and removes only old generated components', () => {
    const { source, output } = fixture('<svg />');
    renameSync(
      path.join(source, 'probe.svg'),
      path.join(source, '123-icon.svg'),
    );
    const existing = path.join(output, 'src/generated/icons');
    mkdirSync(existing, { recursive: true });
    writeFileSync(path.join(existing, 'Old.tsx'), 'old');
    writeFileSync(path.join(existing, 'keep.txt'), 'keep');
    vi.spyOn(console, 'log').mockImplementation(() => {});
    importIcons(source, output);
    expect(
      readFileSync(path.join(existing, 'Icon123IconIcon.tsx'), 'utf8'),
    ).toContain('export function Icon123IconIcon');
    expect(readFileSync(path.join(existing, 'keep.txt'), 'utf8')).toBe('keep');
    expect(() => readFileSync(path.join(existing, 'Old.tsx'))).toThrow();
  });

  it('rejects invalid filenames, symlinks, directories, oversized files, and invalid UTF-8', () => {
    const { source } = fixture('<svg />');
    const file = path.join(source, 'probe.svg');
    renameSync(file, path.join(source, "quote'icon.svg"));
    expect(() => readSvgDirectory(source)).toThrow('filenames');
    rmSync(path.join(source, "quote'icon.svg"));
    symlinkSync('/does-not-exist', file);
    expect(() => readSvgDirectory(source)).toThrow();
    rmSync(file);
    mkdirSync(file);
    expect(() => readSvgDirectory(source)).toThrow('regular file');
    rmSync(file, { recursive: true });
    writeFileSync(file, ' '.repeat(1024 * 1024 + 1));
    expect(() => readSvgDirectory(source)).toThrow('1 MiB');
    writeFileSync(file, Buffer.from([0xff]));
    expect(() => readSvgDirectory(source)).toThrow();
    rmSync(file);
    expect(() => readSvgDirectory(source)).toThrow('No .svg');
  });

  it('bounds batch count and total bytes', () => {
    const { source } = fixture('<svg />');
    for (let n = 0; n < 256; n++)
      writeFileSync(path.join(source, `icon-${n}.svg`), '<svg />');
    expect(() => readSvgDirectory(source)).toThrow('256');
    for (let n = 0; n < 256; n++) rmSync(path.join(source, `icon-${n}.svg`));
    const padded = '<svg />' + ' '.repeat(1024 * 1024 - 7);
    for (let n = 0; n < 17; n++)
      writeFileSync(path.join(source, `icon-${n}.svg`), padded);
    expect(() => readSvgDirectory(source)).toThrow('16 MiB');
  });

  it('reports usage and input errors without an uncaught exception', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(runImporter([])).toBe(1);
    expect(runImporter(['--help'])).toBe(1);
    expect(runImporter(['one', 'two', 'three'])).toBe(1);
    expect(runImporter(['/does-not-exist'])).toBe(1);
    const { source, output } = fixture('<svg />');
    vi.spyOn(console, 'log').mockImplementation(() => {});
    expect(runImporter([source, output])).toBe(0);
  });
});
