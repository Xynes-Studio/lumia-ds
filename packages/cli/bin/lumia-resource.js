#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const [, , rawName] = process.argv;

const usage = () => {
  console.error('Usage: lumia-resource <resourceName>');
  process.exit(1);
};

const toPascalCase = (value) =>
  value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((segment) => segment[0].toUpperCase() + segment.slice(1))
    .join('') || 'Resource';

if (!rawName || rawName === '--help') {
  usage();
}

const resourceName = rawName.trim();

if (!resourceName) {
  usage();
}

const resourcesDir = path.join(process.cwd(), 'src', 'resources');
const targetPath = path.join(resourcesDir, `${resourceName}.resource.ts`);

if (fs.existsSync(targetPath)) {
  console.error(`Resource config already exists at ${targetPath}`);
  process.exit(1);
}

fs.mkdirSync(resourcesDir, { recursive: true });

const resourceConstName = `${toPascalCase(resourceName)}Resource`;

const template = `import { defineResource } from '@lumia/runtime';

export const ${resourceConstName} = defineResource({
  id: '${resourceName}',
  pages: {
    list: '${resourceName}-list',
    detail: '${resourceName}-detail',
    create: '${resourceName}-create',
    update: '${resourceName}-update',
  },
  fields: [
    // Add your resource fields here. Each field should match your form value shape.
    // {
    //   name: 'title',
    //   label: 'Title',
    //   kind: 'text',
    //   validation: [
    //     { name: 'required', message: 'Title is required', validate: (value) => Boolean(value) },
    //   ],
    // },
  ],
  dataFetcher: {
    // create: async (values) => {
    //   // Persist a new record and return the result.
    // },
    // update: async (values) => {
    //   // Persist updates to an existing record.
    // },
  },
});
`;

fs.writeFileSync(targetPath, template, 'utf8');

console.log(
  `Created resource scaffold at ${path.relative(process.cwd(), targetPath)}`,
);
