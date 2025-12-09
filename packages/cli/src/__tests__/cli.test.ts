import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'child_process';
import { resolve } from 'path';

const CLI_PATH = resolve(__dirname, '../../bin/lumia.js');
const PACKAGE_ROOT = resolve(__dirname, '../..');

/**
 * Helper to execute CLI command and return output
 */
function runCli(args: string[]): {
  stdout: string;
  stderr: string;
  exitCode: number;
} {
  try {
    const stdout = execSync(`node ${CLI_PATH} ${args.join(' ')}`, {
      cwd: PACKAGE_ROOT,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { stdout: stdout.trim(), stderr: '', exitCode: 0 };
  } catch (error: unknown) {
    const execError = error as {
      stdout?: string;
      stderr?: string;
      status?: number;
    };
    return {
      stdout: (execError.stdout || '').toString().trim(),
      stderr: (execError.stderr || '').toString().trim(),
      exitCode: execError.status || 1,
    };
  }
}

describe('@lumia/cli', () => {
  beforeAll(() => {
    // Ensure CLI is built before running tests
    try {
      execSync('pnpm build', { cwd: PACKAGE_ROOT, stdio: 'pipe' });
    } catch {
      // Build might already be done or fail - tests will show the issue
    }
  });

  describe('lumia --help', () => {
    it('should print available commands', () => {
      const result = runCli(['--help']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('lumia');
      expect(result.stdout).toContain('CLI utilities for Lumia Design System');
      expect(result.stdout).toContain('version');
      expect(result.stdout).toContain('--help');
      expect(result.stdout).toContain('--version');
    });

    it('should include version command in help output', () => {
      const result = runCli(['--help']);

      expect(result.stdout).toContain('version');
      expect(result.stdout).toContain('Print the CLI version');
    });
  });

  describe('lumia version', () => {
    it('should print the CLI version', () => {
      const result = runCli(['version']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should print version 0.0.0 for initial release', () => {
      const result = runCli(['version']);

      expect(result.stdout).toBe('0.0.0');
    });
  });

  describe('lumia --version', () => {
    it('should print the CLI version with --version flag', () => {
      const result = runCli(['--version']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should print the same version as the version command', () => {
      const versionResult = runCli(['version']);
      const flagResult = runCli(['--version']);

      expect(versionResult.stdout).toBe(flagResult.stdout);
    });
  });

  describe('lumia -v', () => {
    it('should print the CLI version with -v flag', () => {
      const result = runCli(['-v']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('unknown command', () => {
    it('should show error for unknown commands', () => {
      const result = runCli(['unknown-command']);

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('unknown');
    });
  });
});
