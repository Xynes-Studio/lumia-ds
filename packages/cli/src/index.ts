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

  program
    .command('generate <type> <name>')
    .description('Generate a new resource (e.g. component)')
    .action(async (type, name, options) => {
      if (type !== 'component') {
        console.error(`Unknown generator type: ${type}. Supported types: component`);
        process.exit(1);
      }
      const { generateComponent } = await import(
        './commands/generate/component'
      );
      await generateComponent(name, options);
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
