import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createProgram, run, getVersion } from '../index';

describe('getVersion', () => {
  it('should return the CLI version string', () => {
    const version = getVersion();

    expect(version).toBe('0.0.0');
  });

  it('should return a valid semver string', () => {
    const version = getVersion();

    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

describe('createProgram', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should create a Commander program', () => {
    const program = createProgram();

    expect(program).toBeDefined();
    expect(program.name()).toBe('lumia');
  });

  it('should have correct description', () => {
    const program = createProgram();

    expect(program.description()).toBe('CLI utilities for Lumia Design System');
  });

  it('should have version command registered', () => {
    const program = createProgram();
    const commands = program.commands.map((cmd) => cmd.name());

    expect(commands).toContain('version');
  });

  it('should execute version command and log version', () => {
    const program = createProgram();

    // Parse with version command
    program.parse(['node', 'lumia', 'version']);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(/^\d+\.\d+\.\d+$/),
    );
  });

  it('should have --version option configured', () => {
    const program = createProgram();
    const versionOption = program.options.find(
      (opt) => opt.short === '-v' || opt.long === '--version',
    );

    expect(versionOption).toBeDefined();
  });
});

describe('run', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should run the CLI with provided args', () => {
    run(['node', 'lumia', 'version']);

    expect(consoleSpy).toHaveBeenCalledWith('0.0.0');
  });

  it('should parse version command correctly', () => {
    run(['node', 'lumia', 'version']);

    expect(consoleSpy).toHaveBeenCalledTimes(1);
  });
});
