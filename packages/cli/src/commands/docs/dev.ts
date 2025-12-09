import { spawn } from 'child_process';
import chalk from 'chalk';

export async function devDocs(cwd: string = process.cwd()): Promise<void> {
  console.log(chalk.blue('Starting docs dev server...'));

  return new Promise((resolve, reject) => {
    // We assume we are in monorepo root or have access to pnpm
    const child = spawn('pnpm', ['--filter', '@lumia-ui/docs', 'dev'], {
      cwd,
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(chalk.green('Docs server stopped gracefully.'));
        resolve();
      } else {
        console.error(chalk.red(`Docs server exited with code ${code}`));
        resolve(); // Dev server exit usually means stop, not necessarily error needing propagation
      }
    });

    child.on('error', (err) => {
      console.error(chalk.red(`Failed to start docs server: ${err.message}`));
      reject(err);
    });
  });
}
