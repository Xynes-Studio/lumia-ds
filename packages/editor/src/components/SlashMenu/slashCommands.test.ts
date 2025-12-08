import { describe, test, expect, vi } from 'vitest';
import {
    defaultSlashCommands,
    filterSlashCommands,
    getSlashCommandExecutor,
    createSlashCommandFromRegistry,
} from './slashCommands';

// Mock lucide-react to avoid import issues
vi.mock('lucide-react', async (importOriginal) => {
    return await importOriginal();
});

describe('slashCommands', () => {
    describe('defaultSlashCommands', () => {
        test('exports an array of commands', () => {
            expect(Array.isArray(defaultSlashCommands)).toBe(true);
            expect(defaultSlashCommands.length).toBeGreaterThan(0);
        });

        test('each command has required properties', () => {
            defaultSlashCommands.forEach((cmd) => {
                expect(cmd).toHaveProperty('name');
                expect(cmd).toHaveProperty('label');
                expect(cmd).toHaveProperty('description');
                expect(cmd).toHaveProperty('icon');
                expect(cmd).toHaveProperty('keywords');
                expect(cmd).toHaveProperty('execute');
                expect(typeof cmd.name).toBe('string');
                expect(typeof cmd.label).toBe('string');
                expect(typeof cmd.execute).toBe('function');
                expect(Array.isArray(cmd.keywords)).toBe(true);
            });
        });

        test('includes video command with modal type', () => {
            const videoCmd = defaultSlashCommands.find((c) => c.name === 'video');
            expect(videoCmd).toBeDefined();
            expect(videoCmd?.modalType).toBe('media-video');
        });

        test('includes image command with modal type', () => {
            const imageCmd = defaultSlashCommands.find((c) => c.name === 'image');
            expect(imageCmd).toBeDefined();
            expect(imageCmd?.modalType).toBe('media-image');
        });

        test('includes panel command without modal type', () => {
            const panelCmd = defaultSlashCommands.find((c) => c.name === 'panel');
            expect(panelCmd).toBeDefined();
            expect(panelCmd?.modalType).toBeUndefined();
        });
    });

    describe('filterSlashCommands', () => {
        test('returns all commands with empty query', () => {
            const result = filterSlashCommands(defaultSlashCommands, '');
            expect(result).toEqual(defaultSlashCommands);
        });

        test('filters by command name', () => {
            const result = filterSlashCommands(defaultSlashCommands, 'video');
            expect(result.length).toBeGreaterThan(0);
            expect(result.some((c) => c.name.toLowerCase().includes('video'))).toBe(
                true,
            );
        });

        test('filters by command label', () => {
            const result = filterSlashCommands(defaultSlashCommands, 'panel');
            expect(result.length).toBeGreaterThan(0);
        });

        test('filters by keywords', () => {
            // Find a command with keywords and test filtering by keyword
            const commandWithKeywords = defaultSlashCommands.find(
                (c) => c.keywords.length > 0,
            );
            if (commandWithKeywords && commandWithKeywords.keywords[0]) {
                const keyword = commandWithKeywords.keywords[0];
                const result = filterSlashCommands(defaultSlashCommands, keyword);
                expect(result.length).toBeGreaterThan(0);
            }
        });

        test('returns empty for non-matching query', () => {
            const result = filterSlashCommands(
                defaultSlashCommands,
                'xyznonexistent123',
            );
            expect(result).toHaveLength(0);
        });

        test('is case insensitive', () => {
            const result1 = filterSlashCommands(defaultSlashCommands, 'VIDEO');
            const result2 = filterSlashCommands(defaultSlashCommands, 'video');
            expect(result1.length).toBe(result2.length);
        });
    });

    describe('getSlashCommandExecutor', () => {
        test('returns executor for video block type', () => {
            const executor = getSlashCommandExecutor('video');
            expect(executor).toBeDefined();
            expect(typeof executor).toBe('function');
        });

        test('returns executor for image block type', () => {
            const executor = getSlashCommandExecutor('image');
            expect(executor).toBeDefined();
            expect(typeof executor).toBe('function');
        });

        test('returns executor for panel block type', () => {
            const executor = getSlashCommandExecutor('panel');
            expect(executor).toBeDefined();
            expect(typeof executor).toBe('function');
        });

        test('returns executor for table block type', () => {
            const executor = getSlashCommandExecutor('table');
            expect(executor).toBeDefined();
            expect(typeof executor).toBe('function');
        });

        test('returns executor for status block type', () => {
            const executor = getSlashCommandExecutor('status');
            expect(executor).toBeDefined();
            expect(typeof executor).toBe('function');
        });

        test('returns executor for file block type', () => {
            const executor = getSlashCommandExecutor('file');
            expect(executor).toBeDefined();
            expect(typeof executor).toBe('function');
        });

        test('returns undefined for unknown block type', () => {
            const executor = getSlashCommandExecutor('unknownType');
            expect(executor).toBeUndefined();
        });
    });

    describe('createSlashCommandFromRegistry', () => {
        test('creates command for valid block type', () => {
            const command = createSlashCommandFromRegistry('video', {
                execute: () => { },
                modalType: 'media-video',
            });
            expect(command).not.toBeNull();
            expect(command?.name).toBe('video');
            expect(command?.modalType).toBe('media-video');
        });

        test('returns null for invalid block type', () => {
            const command = createSlashCommandFromRegistry(
                'invalidBlockType' as any,
                {
                    execute: () => { },
                },
            );
            expect(command).toBeNull();
        });

        test('applies icon override', () => {
            const mockIcon = () => null;
            const command = createSlashCommandFromRegistry(
                'video',
                { execute: () => { } },
                { icon: mockIcon as any },
            );
            expect(command?.icon).toBe(mockIcon);
        });

        test('applies keywords override', () => {
            const command = createSlashCommandFromRegistry(
                'video',
                { execute: () => { } },
                { keywords: ['custom', 'keywords'] },
            );
            expect(command?.keywords).toEqual(['custom', 'keywords']);
        });
    });
});
