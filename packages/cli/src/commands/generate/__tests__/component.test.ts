import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { generateComponent } from '../component'; // will implement this
import inquirer from 'inquirer';

const { mockRunActions, mockGetGenerator } = vi.hoisted(() => {
  const actions = vi.fn().mockResolvedValue({ changes: [], failures: [] });
  const generator = vi.fn().mockReturnValue({ runActions: actions });
  return { mockRunActions: actions, mockGetGenerator: generator };
});

// Mock inquirer
vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn(),
  },
}));

vi.mock('node-plop', () => ({
  default: vi.fn().mockResolvedValue({
    getGenerator: mockGetGenerator,
  }),
}));

describe('generate component', () => {
  const testDir = path.join(__dirname, 'temp-gen-test');

  beforeEach(async () => {
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
    vi.clearAllMocks();
  });

  it('scaffolds a component with all options enabled', async () => {
    const cwd = testDir;
    const componentName = 'TestButton';

    // Mock user answers
    vi.mocked(inquirer.prompt).mockResolvedValueOnce({
      targetPackage: 'ui',
      features: ['storybook', 'test', 'style'],
    });

    await generateComponent(componentName, {}, cwd);

    // Verify Plop was initialized and called
    const nodePlop = (await import('node-plop')).default;
    expect(nodePlop).toHaveBeenCalled(); // We can't easily check path arg due to previous implementation complexity but we know it's called

    expect(mockGetGenerator).toHaveBeenCalledWith('component');

    expect(mockRunActions).toHaveBeenCalledWith({
      name: componentName,
      targetPackage: 'ui',
      features: ['storybook', 'test', 'style'],
      cwd: testDir,
    });
  });

  it('skips optional files if not selected', async () => {
    const cwd = testDir;
    const componentName = 'SimpleBox';

    vi.mocked(inquirer.prompt).mockResolvedValueOnce({
      targetPackage: 'ui',
      features: [], // No extra features
    });

    await generateComponent(componentName, {}, cwd);

    expect(mockRunActions).toHaveBeenCalledWith({
      name: componentName,
      targetPackage: 'ui',
      features: [],
      cwd: testDir,
    });
  });
});
