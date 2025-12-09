import { Command } from 'commander';
import { generateComponent } from './commands/generate/component';
import { buildTokens, validateTokens } from './commands/tokens/index';
import { buildIcons } from './commands/icons/index';
import { devDocs, buildDocs } from './commands/docs/index';

// CLI version - read from package.json via tsup banner or hardcoded
const CLI_VERSION = '0.0.0';

/**
 * Get the package version
 */
export function getVersion(): string {
  return CLI_VERSION;
}

/**
 * Create the Lumia CLI program
 */
export function createProgram(): Command {
  const version = getVersion();

  const program = new Command();

  program
    .name('lumia')
    .description('CLI utilities for Lumia Design System')
    .version(version, '-v, --version', 'Output the current version');

  program
    .command('version')
    .description('Print the CLI version')
    .action(() => {
      console.log(version);
    });

  program
    .command('generate <type> <name>')
    .description('Generate a new resource (e.g. component)')
    .action(async (type, name, options) => {
      if (type !== 'component') {
        console.error(
          `Unknown generator type: ${type}. Supported types: component`,
        );
        process.exit(1);
      }
      await generateComponent(name, options);
    });

  const tokens = program.command('tokens').description('Manage design tokens');

  tokens
    .command('build')
    .description('Build tokens using Style Dictionary (runs pnpm build:tokens)')
    .action(async () => {
      try {
        await buildTokens();
      } catch {
        process.exit(1);
      }
    });

  tokens
    .command('validate [dir]')
    .description('Validate token JSON files (duplicates, missing types)')
    .action(async (dir) => {
      const targetDir = dir || 'tokens'; // Default to 'tokens'
      const { valid } = await validateTokens(targetDir);
      if (!valid) {
        process.exit(1);
      }
    });

  const icons = program.command('icons').description('Manage icons');

  icons
    .command('build')
    .description(
      'Build icons and generating React components (runs pnpm build:icons)',
    )
    .action(async () => {
      try {
        await buildIcons();
      } catch {
        process.exit(1);
      }
    });

  const docs = program.command('docs').description('Manage documentation');

  docs
    .command('dev')
    .description('Start docs development server')
    .action(async () => {
      try {
        await devDocs();
      } catch {
        process.exit(1);
      }
    });

  docs
    .command('build')
    .description('Build documentation')
    .action(async () => {
      try {
        await buildDocs();
      } catch {
        process.exit(1);
      }
    });

  return program;
}

/**
 * Run the CLI program
 */
export function run(args: string[] = process.argv): void {
  const program = createProgram();
  program.parse(args);
}

export { Command };
