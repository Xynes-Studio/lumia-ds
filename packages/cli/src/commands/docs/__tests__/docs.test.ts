
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { devDocs } from '../dev';
import { buildDocs } from '../build';
import { spawn } from 'child_process';
import EventEmitter from 'events';

vi.mock('child_process');

describe('docs commands', () => {
    let mockChildProcess: EventEmitter & { stdout: EventEmitter; stderr: EventEmitter };

    beforeEach(() => {
        mockChildProcess = new EventEmitter() as EventEmitter & { stdout: EventEmitter; stderr: EventEmitter };
        mockChildProcess.stdout = new EventEmitter();
        mockChildProcess.stderr = new EventEmitter();
        (spawn as unknown as Mock).mockReturnValue(mockChildProcess);
        vi.spyOn(console, 'log').mockImplementation(() => { });
        vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('devDocs', () => {
        it('should spawn pnpm dev command for @lumia/docs', async () => {
            const promise = devDocs();
            mockChildProcess.emit('close', 0);
            await promise;

            expect(spawn).toHaveBeenCalledWith(
                'pnpm',
                ['--filter', '@lumia/docs', 'dev'],
                expect.objectContaining({
                    stdio: 'inherit',
                    shell: true,
                })
            );
        });

        it('should resolve when process exits with 0', async () => {
            const promise = devDocs();
            mockChildProcess.emit('close', 0);
            await expect(promise).resolves.toBeUndefined();
        });

        it('should resolve (not reject) when process exits with non-zero (dev server stop)', async () => {
            const promise = devDocs();
            mockChildProcess.emit('close', 1);
            await expect(promise).resolves.toBeUndefined();
        });
    });

    describe('buildDocs', () => {
        it('should spawn pnpm build command for @lumia/docs', async () => {
            const promise = buildDocs();
            mockChildProcess.emit('close', 0);
            await promise;

            expect(spawn).toHaveBeenCalledWith(
                'pnpm',
                ['--filter', '@lumia/docs', 'build'],
                expect.objectContaining({
                    stdio: 'inherit',
                    shell: true,
                })
            );
        });

        it('should reject when process exits with non-zero', async () => {
            const promise = buildDocs();
            mockChildProcess.emit('close', 1);
            await expect(promise).rejects.toThrow('Build failed with code 1');
        });
    });
});
