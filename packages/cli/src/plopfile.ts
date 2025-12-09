interface GeneratorData {
  name: string;
  targetPackage: string;
  features: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function (plop: any) {
  plop.setGenerator('component', {
    description: 'Generate a new component',
    prompts: [], // We handle prompts via Inquirer in the CLI command
    actions: (data: unknown) => {
      const generatorData = data as GeneratorData;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const actions: any[] = [];
      const { targetPackage, features } = generatorData;
      const componentDir = `packages/${targetPackage}/src/components/{{pascalCase name}}`;

      // Main Component
      actions.push({
        type: 'add',
        path: `${componentDir}/{{pascalCase name}}.tsx`,
        templateFile: '../templates/component/component.hbs',
      });

      // Story
      if (features.includes('storybook')) {
        actions.push({
          type: 'add',
          path: `${componentDir}/{{pascalCase name}}.stories.tsx`,
          templateFile: '../templates/component/story.hbs',
        });
      }

      // Test
      if (features.includes('test')) {
        actions.push({
          type: 'add',
          path: `${componentDir}/{{pascalCase name}}.test.tsx`,
          templateFile: '../templates/component/test.hbs',
        });
      }

      // Style
      if (features.includes('style')) {
        actions.push({
          type: 'add',
          path: `${componentDir}/{{pascalCase name}}.css`,
          templateFile: '../templates/component/style.hbs',
        });
      }

      return actions;
    },
  });
}
