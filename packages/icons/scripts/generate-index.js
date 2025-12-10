const fs = require('fs');
const path = require('path');

const generatedDir = path.join(__dirname, '../src/generated');
const indexFile = path.join(generatedDir, 'index.ts');

if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir);
}

const files = fs
  .readdirSync(generatedDir)
  .filter((file) => file.endsWith('.tsx'))
  .map((file) => file.replace('.tsx', ''));

const indexContent = files
  .map((file) => {
    const exportName = file.startsWith('Icon') ? file : `Icon${file}`;
    return `export { default as ${exportName} } from './${file}';`;
  })
  .join('\n');

fs.writeFileSync(indexFile, indexContent + '\n');
console.log('Generated index.ts for icons');

const registryFile = path.join(generatedDir, 'registry.ts');

function toKebabCase(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

const registryContent = `
import type { RegisterIconFn } from '../types';
${files
  .map((file) => {
    const exportName = file.startsWith('Icon') ? file : `Icon${file}`;
    return `import ${exportName} from './${file}';`;
  })
  .join('\n')}

export const registerGeneratedIcons = (register: RegisterIconFn) => {
  ${files
    .map((file) => {
      const exportName = file.startsWith('Icon') ? file : `Icon${file}`;
      const id = toKebabCase(file);
      return `register('${id}', ${exportName});`;
    })
    .join('\n  ')}
};
`;

fs.writeFileSync(registryFile, registryContent);
console.log('Generated registry.ts for icons');
