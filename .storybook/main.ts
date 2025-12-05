import path from 'node:path';
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../packages/components/src/**/*.stories.@(ts|tsx)',
    '../packages/runtime/src/**/*.stories.@(ts|tsx)',
    '../packages/editor/src/**/*.stories.@(tsx|mdx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@lumia/theme': path.resolve(__dirname, '../packages/theme/src'),
      '@lumia/tokens': path.resolve(__dirname, '../packages/tokens/src'),
      '@lumia/components': path.resolve(__dirname, '../packages/components/src'),
      '@lumia/layout': path.resolve(__dirname, '../packages/layout/src'),
      '@lumia/forms': path.resolve(__dirname, '../packages/forms/src'),
      '@lumia/icons': path.resolve(__dirname, '../packages/icons/src'),
      '@lumia/editor': path.resolve(__dirname, '../packages/editor/src'),
    };

    return config;
  },
};

export default config;
