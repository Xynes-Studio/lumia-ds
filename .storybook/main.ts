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
      '@lumia-ui/theme': path.resolve(__dirname, '../packages/theme/src'),
      // The CSS file must be resolved from dist, not src - order matters, more specific alias first
      '@lumia-ui/tokens/dist': path.resolve(__dirname, '../packages/tokens/dist'),
      '@lumia-ui/tokens': path.resolve(__dirname, '../packages/tokens/src'),
      '@lumia-ui/components': path.resolve(__dirname, '../packages/components/src'),
      '@lumia-ui/layout': path.resolve(__dirname, '../packages/layout/src'),
      '@lumia-ui/forms': path.resolve(__dirname, '../packages/forms/src'),
      '@lumia-ui/icons': path.resolve(__dirname, '../packages/icons/src'),
      '@lumia-ui/editor': path.resolve(__dirname, '../packages/editor/src'),
    };

    return config;
  },
};

export default config;
