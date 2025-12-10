import { spawn } from 'child_process';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';

export async function buildTokens(cwd: string = process.cwd()): Promise<void> {
  console.log(chalk.blue('Building tokens...'));

  // Check if build:tokens script exists
  const pkgPath = path.join(cwd, 'package.json');
  if (await fs.pathExists(pkgPath)) {
    const pkg = await fs.readJson(pkgPath);
    if (!pkg.scripts || !pkg.scripts['build:tokens']) {
      console.warn(
        chalk.yellow(
          'No "build:tokens" script found in package.json. Attempting to run anyways...',
        ),
      );
    }
  } else {
    console.warn(
      chalk.yellow(
        'No package.json found. Attempting to run "pnpm build:tokens" anyways...',
      ),
    );
  }

  return new Promise((resolve, reject) => {
    const child = spawn('pnpm', ['build:tokens'], {
      cwd,
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(chalk.green('Tokens built successfully!'));
        resolve();
      } else {
        console.error(chalk.red(`Token build failed with code ${code}`));
        reject(new Error(`Build failed with code ${code}`));
      }
    });

    child.on('error', (err) => {
      console.error(chalk.red(`Failed to start build process: ${err.message}`));
      reject(err);
    });
  });
}
