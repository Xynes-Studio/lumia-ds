import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import {
  componentTemplate,
  storyTemplate,
  testTemplate,
  styleTemplate,
} from './templates';

export interface GenerateComponentOptions {
  // Add options here if needed in future, currently empty or generic
  [key: string]: unknown;
}

export const generateComponent = async (
  name: string,
  options: GenerateComponentOptions,
  cwd: string = process.cwd(),
) => {
  console.log(chalk.blue(`Scaffolding component: ${name}`));

  // 1. Prompt for details
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'package',
      message: 'Which package does this component belong to?',
      choices: ['ui', 'forms', 'layout', 'components', 'core'],
      default: 'ui',
    },
    {
      type: 'checkbox',
      name: 'features',
      message: 'What files should be generated?',
      choices: [
        { name: 'Storybook Story', value: 'storybook', checked: true },
        { name: 'Test File', value: 'test', checked: true },
        { name: 'Style File', value: 'style', checked: false },
      ],
    },
  ]);

  const targetPackage = answers.package;
  const features = answers.features as string[];

  // 2. Define paths
  // Assuming standard monorepo structure: packages/<package>/src/components/<Name>
  // If 'ui', 'forms' etc usually have a 'components' dir.

  const componentDir = path.join(
    cwd,
    'packages',
    targetPackage,
    'src',
    'components',
    name,
  );

  // Check if component already exists
  if (await fs.pathExists(componentDir)) {
    console.error(
      chalk.red(`Component ${name} already exists at ${componentDir}`),
    );
    return;
  }

  // 3. Create directory
  await fs.ensureDir(componentDir);

  // 4. Write files

  // Main Component File
  const componentContent = componentTemplate(name);
  await fs.writeFile(path.join(componentDir, `${name}.tsx`), componentContent);
  console.log(chalk.green(`Created ${name}.tsx`));

  // Story file
  if (features.includes('storybook')) {
    const storyContent = storyTemplate(name);
    await fs.writeFile(
      path.join(componentDir, `${name}.stories.tsx`),
      storyContent,
    );
    console.log(chalk.green(`Created ${name}.stories.tsx`));
  }

  // Test file
  if (features.includes('test')) {
    const testContent = testTemplate(name);
    await fs.writeFile(
      path.join(componentDir, `${name}.test.tsx`),
      testContent,
    );
    console.log(chalk.green(`Created ${name}.test.tsx`));
  }

  // Style file
  if (features.includes('style')) {
    const styleContent = styleTemplate(name);
    await fs.writeFile(path.join(componentDir, `${name}.css`), styleContent);
    console.log(chalk.green(`Created ${name}.css`));
  }

  console.log(
    chalk.blue(
      `\nSuccessfully generated component ${name} in @lumia/${targetPackage}`,
    ),
  );
};
