#!/usr/bin/env node
// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { readSvgDirectory } = require('../../cli/bin/lib/svg-import');

/** @param {string[]} files */
function indexes(files) {
  const names = files.map((file) => ({
    file,
    name: file.startsWith('Icon') ? file : `Icon${file}`,
    id: file.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase(),
  }));
  return {
    index:
      names
        .map(
          ({ file, name }) => `export { default as ${name} } from './${file}';`,
        )
        .join('\n') + '\n',
    registry: `\nimport type { RegisterIconFn } from '../types';\n${names.map(({ file, name }) => `import ${name} from './${file}';`).join('\n')}\n\nexport const registerGeneratedIcons = (register: RegisterIconFn) => {\n${names.map(({ id, name }) => `  register('${id}', ${name});`).join('\n')}\n};\n`,
  };
}

/** Snapshot and validate the full batch, generate in isolation, then replace output.
 * @param {string} sourceDir
 * @param {string} generatedDir
 */
function buildIcons(sourceDir, generatedDir) {
  const source = fs.realpathSync(path.resolve(sourceDir));
  const requestedOutput = path.resolve(generatedDir);
  const output = path.join(
    fs.realpathSync(path.dirname(requestedOutput)),
    path.basename(requestedOutput),
  );
  if (
    source === output ||
    source.startsWith(output + path.sep) ||
    output.startsWith(source + path.sep)
  )
    throw new Error('SVG source and generated output must be separate');
  const inputs = readSvgDirectory(source);
  const normalized = new Set();
  for (const { baseName } of inputs) {
    const name = baseName.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
    if (normalized.has(name))
      throw new Error('SVG filenames produce duplicate icon names');
    normalized.add(name);
  }
  if (
    fs.existsSync(output) &&
    (!fs.lstatSync(output).isDirectory() ||
      fs.lstatSync(output).isSymbolicLink())
  )
    throw new Error('Generated output must be a regular directory');
  const staging = fs.mkdtempSync(
    path.join(path.dirname(output), '.svgr-build-'),
  );
  const snapshots = path.join(staging, 'svg');
  const rendered = path.join(staging, 'generated');
  const backup = path.join(staging, 'previous');
  let committed = false;
  try {
    fs.mkdirSync(snapshots);
    for (const { file, source: bytes } of inputs)
      fs.writeFileSync(path.join(snapshots, file), bytes, 'utf8');
    const cli = path.join(
      path.dirname(require.resolve('@svgr/cli/package.json')),
      'bin/svgr',
    );
    const result = spawnSync(
      process.execPath,
      [
        cli,
        '--config-file',
        path.resolve(__dirname, '../svgr.config.js'),
        '--out-dir',
        rendered,
        '--no-index',
        snapshots,
      ],
      {
        cwd: path.resolve(__dirname, '..'),
        encoding: 'utf8',
        timeout: 30_000,
        maxBuffer: 1024 * 1024,
      },
    );
    if (result.error || result.status !== 0)
      throw new Error('SVG generation failed; previous output preserved');
    const files = fs
      .readdirSync(rendered)
      .filter((file) => file.endsWith('.tsx'))
      .sort();
    if (
      files.length !== inputs.length ||
      files.some((file) => !/^[A-Za-z0-9_]+\.tsx$/.test(file))
    )
      throw new Error('Generated icon batch is incomplete');
    const content = indexes(files.map((file) => file.slice(0, -4)));
    fs.writeFileSync(path.join(rendered, 'index.ts'), content.index);
    fs.writeFileSync(path.join(rendered, 'registry.ts'), content.registry);
    const hadOutput = fs.existsSync(output);
    if (hadOutput) fs.renameSync(output, backup);
    try {
      fs.renameSync(rendered, output);
      committed = true;
    } catch (error) {
      if (hadOutput) fs.renameSync(backup, output);
      throw error;
    }
  } finally {
    // Retain the previous batch if even the rollback rename failed.
    if (committed || !fs.existsSync(backup))
      fs.rmSync(staging, { recursive: true, force: true });
  }
}

/** @param {string[]} args */
function run(args) {
  if (args.length > 2 || args.includes('--help')) {
    console.error(
      'Usage: build-icons [svg-source-directory] [generated-output-directory]',
    );
    return args.includes('--help') ? 0 : 1;
  }
  try {
    buildIcons(
      args[0] || path.resolve(__dirname, '../svg'),
      args[1] || path.resolve(__dirname, '../src/generated'),
    );
    return 0;
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : 'SVG generation failed',
    );
    return 1;
  }
}
if (require.main === module) process.exitCode = run(process.argv.slice(2));
module.exports = { buildIcons, run };
