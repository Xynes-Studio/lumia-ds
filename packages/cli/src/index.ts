import { Command } from 'commander';

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
