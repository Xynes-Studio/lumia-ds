import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import nodePlop from 'node-plop';

export interface GenerateComponentOptions {
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
      name: 'targetPackage', // Changed from 'package' to 'targetPackage' to match plopfile
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

  // 2. Prepare data for Plop
  const plopData = {
    name,
    targetPackage: answers.targetPackage,
    features: answers.features,
    cwd, // Passing cwd to be safe, though plopfile uses relative paths for templates, output path is constructed
  };

  // 3. Initialize Plop
  // Locate plopfile. In dist (bundled), it's a sibling of index.js. In src, it's relative.

  const possiblePaths = [
    path.join(__dirname, 'plopfile.mjs'), // ESM build (preferred)
    path.join(__dirname, 'plopfile.js'),
    path.join(__dirname, '../../plopfile.ts'), // Src dev mode
    path.resolve(process.cwd(), 'packages/cli/src/plopfile.ts'), // Test mode from root
    path.resolve(process.cwd(), 'src/plopfile.ts'), // Test mode from package root
  ];

  const finalPlopPath = possiblePaths.find((p) => fs.existsSync(p));

  if (!finalPlopPath) {
    console.error(chalk.red('Could not find plopfile. Searched in:'));
    possiblePaths.forEach((p) => console.error(`- ${p}`));
    // Debug: print cwd
    console.error('CWD:', process.cwd());
    process.exit(1);
  } else {
    // Debug for test
    if (process.env.NODE_ENV === 'test') {
      console.log('Using plopfile at:', finalPlopPath);
    }
  }

  try {
    const plop = await nodePlop(finalPlopPath, {
      destBasePath: cwd,
      force: false,
    });

    const generator = plop.getGenerator('component');

    const result = await generator.runActions(plopData);

    if (result.failures && result.failures.length > 0) {
      console.error(chalk.red('Error generating component:'));
      result.failures.forEach((f) => {
        console.error(chalk.red(`- ${f.path}: ${f.error}`));
      });
      throw new Error('Component generation failed');
    }

    // Log changes
    result.changes.forEach((change) => {
      console.log(chalk.green(`[${change.type}] ${change.path}`));
    });

    console.log(
      chalk.blue(
        `\nSuccessfully generated component ${name} in @lumia-ui/${answers.targetPackage}`,
      ),
    );
  } catch (error) {
    console.error(chalk.red('Failed to run generator'), error);
    if (process.env.NODE_ENV === 'test') {
      throw error;
    }
    process.exit(1);
  }
};
