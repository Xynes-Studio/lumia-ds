import { spawn } from 'child_process';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';

/**
 * Convert kebab-case to PascalCase
 */
function toPascalCase(str: string): string {
  return str.replace(/(^\w|-\w)/g, (clear) =>
    clear.replace('-', '').toUpperCase(),
  );
}

export async function buildIcons(cwd: string = process.cwd()): Promise<void> {
  console.log(chalk.blue('Building icons...'));

  // Run the build command
  await new Promise<void>((resolve, reject) => {
    // We want to run pnpm build:icons in the root workspace or target the icons package
    // Since we are likely running from root, we can use --filter @lumia/icons
    // Or if we are in the monorepo root, just `pnpm --filter @lumia/icons build:icons`

    // We'll assume we are running from root or somewhere where pnpm can find the workspace
    const command = 'pnpm';
    const args = ['--filter', '@lumia/icons', 'build:icons'];

    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(chalk.green('Icons built successfully!'));
        resolve();
      } else {
        console.error(chalk.red(`Icon build failed with code ${code}`));
        reject(new Error(`Build failed with code ${code}`));
      }
    });

    child.on('error', (err) => {
      console.error(chalk.red(`Failed to start build process: ${err.message}`));
      reject(err);
    });
  });

  // Validation: Check for unregistered SVGs
  try {
    const iconsPkgPath = path.join(cwd, 'packages/icons');
    const svgDir = path.join(iconsPkgPath, 'svg');
    const generatedDir = path.join(iconsPkgPath, 'src/generated');

    if ((await fs.pathExists(svgDir)) && (await fs.pathExists(generatedDir))) {
      const svgFiles = (await fs.readdir(svgDir)).filter((f) =>
        f.endsWith('.svg'),
      );
      const generatedFiles = (await fs.readdir(generatedDir)).filter((f) =>
        f.endsWith('.tsx'),
      );

      const unregistered: string[] = [];

      for (const svgFile of svgFiles) {
        const baseName = path.basename(svgFile, '.svg');
        const pascalName = toPascalCase(baseName);

        // svgr can generate IconName.tsx or Name.tsx depending on settings,
        // but typically it generates PascalCase.tsx.
        // Also sometimes prefix "Icon" is added.
        // Let's check for exact PascalCase match OR PascalCase with Icon prefix if not present.

        // The generate-index.js script in icons package handles exports:
        // const exportName = file.startsWith('Icon') ? file : `Icon${file}`;

        // We just want to know if a file exists that corresponds to this SVG.
        // svgr usually outputs [PascalName].tsx

        // Let's look for PascalName.tsx
        const expectedFile = `${pascalName}.tsx`;
        // Also check potentially IconPascalName.tsx just in case
        const expectedFileWithIcon = `Icon${pascalName}.tsx`;

        if (
          !generatedFiles.includes(expectedFile) &&
          !generatedFiles.includes(expectedFileWithIcon)
        ) {
          unregistered.push(svgFile);
        }
      }

      if (unregistered.length > 0) {
        console.warn(
          chalk.yellow(
            '\nWarning: The following SVGs do not appear to have generated components:',
          ),
        );
        unregistered.forEach((f) => console.warn(chalk.yellow(`  - ${f}`)));
        console.warn(
          chalk.yellow(
            'Ensure they are valid SVGs and the build completed successfully.\n',
          ),
        );
      }
    } else {
      // If directories don't exist, we might not be in root or paths are different.
      // Just fail silently or log debug info?
      // We'll silently skip validation if paths are not found as expected structure.
    }
  } catch {
    console.warn(chalk.yellow('Failed to run validation check for icons.'));
    // Don't fail the command, just warn
  }
}
