import type { Preview } from '@storybook/react';
import { ThemeProvider } from '@lumia/theme';
import { defaultTheme } from '@lumia/tokens';
import './preview.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={defaultTheme}>
        <div className="min-h-screen bg-background text-foreground antialiased">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default preview;
