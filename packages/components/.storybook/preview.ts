import type { Preview } from '@storybook/react';
import { createElement, Fragment } from 'react';
import { IconSprite } from '@lumia-ui/icons';
import './preview.css';

const preview: Preview = {
  decorators: [
    (Story) =>
      createElement(
        Fragment,
        null,
        createElement(IconSprite),
        createElement(Story),
      ),
  ],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
