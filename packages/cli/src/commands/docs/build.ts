import { spawn } from 'child_process';
import chalk from 'chalk';

export async function buildDocs(cwd: string = process.cwd()): Promise<void> {
  console.log(chalk.blue('Building docs...'));

  return new Promise((resolve, reject) => {
    const child = spawn('pnpm', ['--filter', '@lumia-ui/docs', 'build'], {
      cwd,
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(chalk.green('Docs built successfully!'));
        resolve();
      } else {
        console.error(chalk.red(`Docs build failed with code ${code}`));
        reject(new Error(`Build failed with code ${code}`));
      }
    });

    child.on('error', (err) => {
      console.error(chalk.red(`Failed to start docs build: ${err.message}`));
      reject(err);
    });
  });
}
