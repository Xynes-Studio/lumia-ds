/* eslint-disable no-undef */
import StyleDictionary from 'style-dictionary';
import { generatePrimaryScale, contrast } from './sd-transforms.mjs';

// Basic pascal case that handles hyphens/underscores
const pascalCasePart = (s) =>
  s
    .split(/[\s-_]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');

// Helper for kebab case
const kebabCasePart = (s) =>
  s
    .split(/[\s-_]+/)
    .map((w) => w.toLowerCase())
    .join('-');

console.log('Registering custom transforms setup...');

// Register on Class to be safe (debug-sd.mjs used Class)
// But wait, Step 168 showed Instance registration working for 'name/path-pascal' syntax usage?
// I'll register on BOTH or just Class.
// Class registration is global.

StyleDictionary.registerTransform({
  name: 'color/scale',
  type: 'value',
  transitive: true,
  matcher: (token) => {
    // Match if stop is present and type is color
    return !!token.stop && token.type === 'color';
  },
  transform: (token) => {
    if (!token.stop) return token.value;
    const scale = generatePrimaryScale(token.value);
    return scale[token.stop];
  },
});

StyleDictionary.registerTransform({
  name: 'color/contrast',
  type: 'value',
  transitive: true,
  matcher: (token) => !!token.isContrast && token.type === 'color',
  transform: (token) => {
    if (!token.isContrast) return token.value;
    return contrast(token.value);
  },
});

StyleDictionary.registerTransform({
  name: 'name/path-pascal',
  type: 'name',
  transform: (token) => {
    const name = token.path.map(pascalCasePart).join('');
    return name;
  },
});

StyleDictionary.registerTransform({
  name: 'name/path-kebab',
  type: 'name',
  transform: (token) => {
    const name = token.path.map(kebabCasePart).join('-');
    return name;
  },
});

const config = {
  source: ['tokens/**/*.json'],
  platforms: {
    src: {
      transforms: [
        'attribute/cti',
        'name/path-pascal',
        'size/rem',
        'color/hex',
        'color/scale',
        'color/contrast',
      ],
      buildPath: 'src/generated/',
      files: [
        {
          destination: 'tokens.ts',
          format: 'javascript/es6',
        },
      ],
    },
    css: {
      transforms: [
        'attribute/cti',
        'name/path-kebab',
        'size/rem',
        'color/scale',
        'color/contrast',
      ],
      buildPath: 'dist/css/',
      files: [
        {
          destination: 'variables.css',
          format: 'css/variables',
        },
      ],
    },
    ts: {
      transforms: [
        'attribute/cti',
        'name/path-pascal',
        'size/rem',
        'color/hex',
        'color/scale',
        'color/contrast',
      ],
      buildPath: 'dist/ts/',
      files: [
        {
          destination: 'tokens.ts',
          format: 'javascript/es6',
        },
        {
          destination: 'tokens.d.ts',
          format: 'typescript/es6-declarations',
        },
      ],
    },
  },
  // log: { verbosity: 'verbose' }
};

console.log('Building tokens...');
const sd = new StyleDictionary(config);
await sd.buildAllPlatforms();
console.log('Done.');
