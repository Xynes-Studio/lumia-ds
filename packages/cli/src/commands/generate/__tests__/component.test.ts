import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { generateComponent } from '../component'; // will implement this
import inquirer from 'inquirer';

// Mock inquirer
vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn(),
  },
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
      package: 'ui',
      features: ['storybook', 'test', 'style'],
    });

    await generateComponent(componentName, {}, cwd);

    const componentPath = path.join(
      testDir,
      'packages/ui/src/components',
      componentName,
    );

    // Check directory exists
    expect(await fs.pathExists(componentPath)).toBe(true);

    // Check files exist
    expect(
      await fs.pathExists(path.join(componentPath, `${componentName}.tsx`)),
    ).toBe(true);
    expect(
      await fs.pathExists(
        path.join(componentPath, `${componentName}.stories.tsx`),
      ),
    ).toBe(true);
    expect(
      await fs.pathExists(
        path.join(componentPath, `${componentName}.test.tsx`),
      ),
    ).toBe(true);
    expect(
      await fs.pathExists(path.join(componentPath, `${componentName}.css`)),
    ).toBe(true); // assuming css module or plain css based on prompt. logic said 'style'

    // Verify content snippet (basic check)
    const content = await fs.readFile(
      path.join(componentPath, `${componentName}.tsx`),
      'utf-8',
    );
    expect(content).toContain(`export const ${componentName}`);
  });

  it('skips optional files if not selected', async () => {
    const cwd = testDir;
    const componentName = 'SimpleBox';

    vi.mocked(inquirer.prompt).mockResolvedValueOnce({
      package: 'ui',
      features: [], // No extra features
    });

    await generateComponent(componentName, {}, cwd);

    const componentPath = path.join(
      testDir,
      'packages/ui/src/components',
      componentName,
    );

    expect(
      await fs.pathExists(path.join(componentPath, `${componentName}.tsx`)),
    ).toBe(true);
    expect(
      await fs.pathExists(
        path.join(componentPath, `${componentName}.stories.tsx`),
      ),
    ).toBe(false);
    expect(
      await fs.pathExists(
        path.join(componentPath, `${componentName}.test.tsx`),
      ),
    ).toBe(false);
  });
});
