import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import { buildIcons } from '../build';
import { spawn } from 'child_process';

// Mock child_process and fs
vi.mock('child_process');
vi.mock('fs-extra');

describe('Icon Commands', () => {
  const TEST_CWD = '/test/cwd';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('buildIcons', () => {
    it('should execute pnpm build:icons', async () => {
      // Mock spawn to return a successful process
      const mockChild = {
        on: vi.fn().mockImplementation((event, cb) => {
          if (event === 'close') {
            cb(0);
          }
        }),
      };
      (spawn as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockChild);

      // Mock fs paths check to avoid validation logic failing
      (fs.pathExists as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        false,
      );

      await buildIcons(TEST_CWD);

      expect(spawn).toHaveBeenCalledWith(
        'pnpm',
        ['--filter', '@lumia-ui/icons', 'build:icons'],
        expect.objectContaining({
          cwd: TEST_CWD,
          shell: true,
        }),
      );
    });

    it('should warn about unregistered SVGs', async () => {
      // Mock spawn success
      const mockChild = {
        on: vi.fn().mockImplementation((event, cb) => {
          if (event === 'close') {
            cb(0);
          }
        }),
      };
      (spawn as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockChild);

      // Mock file system for validation
      (fs.pathExists as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        true,
      );
      (fs.readdir as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        async (dirPath) => {
          if (typeof dirPath === 'string' && dirPath.endsWith('svg')) {
            return ['valid-icon.svg', 'orphan-icon.svg'];
          }
          if (typeof dirPath === 'string' && dirPath.endsWith('generated')) {
            // valid-icon.svg -> ValidIcon.tsx
            return ['ValidIcon.tsx', 'AnotherIcon.tsx'];
          }
          return [];
        },
      );

      await buildIcons(TEST_CWD);

      // orphan-icon.svg -> OrphanIcon.tsx (missing)
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('orphan-icon.svg'),
      );
    });

    it('should pass validation checks when all SVGs are generated', async () => {
      // Mock spawn success
      const mockChild = {
        on: vi.fn().mockImplementation((event, cb) => {
          if (event === 'close') {
            cb(0);
          }
        }),
      };
      (spawn as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockChild);

      // Mock file system for validation
      (fs.pathExists as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        true,
      );
      (fs.readdir as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        async (dirPath) => {
          if (typeof dirPath === 'string' && dirPath.endsWith('svg')) {
            return ['my-icon.svg'];
          }
          if (typeof dirPath === 'string' && dirPath.endsWith('generated')) {
            return ['MyIcon.tsx'];
          }
          return [];
        },
      );

      await buildIcons(TEST_CWD);
      expect(console.warn).not.toHaveBeenCalledWith(
        expect.stringContaining(
          'Warning: The following SVGs do not appear to have generated components',
        ),
      );
    });

    it('should pass validation checks when generated file has Icon prefix', async () => {
      // Mock spawn success
      const mockChild = {
        on: vi.fn().mockImplementation((event, cb) => {
          if (event === 'close') {
            cb(0);
          }
        }),
      };
      (spawn as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockChild);

      // Mock file system for validation
      (fs.pathExists as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        true,
      );
      (fs.readdir as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        async (dirPath) => {
          if (typeof dirPath === 'string' && dirPath.endsWith('svg')) {
            return ['my-icon.svg'];
          }
          if (typeof dirPath === 'string' && dirPath.endsWith('generated')) {
            return ['IconMyIcon.tsx'];
          }
          return [];
        },
      );

      await buildIcons(TEST_CWD);
      expect(console.warn).not.toHaveBeenCalledWith(
        expect.stringContaining(
          'Warning: The following SVGs do not appear to have generated components',
        ),
      );
    });

    it('should handle build failure', async () => {
      // Mock spawn failure
      const mockChild = {
        on: vi.fn().mockImplementation((event, cb) => {
          if (event === 'close') {
            cb(1);
          }
        }),
      };
      (spawn as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockChild);

      await expect(buildIcons(TEST_CWD)).rejects.toThrow(
        'Build failed with code 1',
      );
    });
  });
});
