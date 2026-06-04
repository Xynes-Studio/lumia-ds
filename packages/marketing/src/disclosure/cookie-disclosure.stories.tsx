/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';

import { CookieDisclosure } from './cookie-disclosure';

const meta = {
  title: 'Marketing/CookieDisclosure',
  component: CookieDisclosure,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { policyUrl: '/legal/cookies' },
} satisfies Meta<typeof CookieDisclosure>;

export default meta;
type Story = StoryObj<typeof CookieDisclosure>;

export const Default: Story = {};

export const CustomCopy: Story = {
  args: {
    policyUrl: '/legal/cookies',
    message: 'We use a session cookie only.',
    policyLabel: 'Learn more',
    dismissLabel: 'Got it',
  },
};

export const Dark: Story = {
  decorators: [
    (Story) => (
      <div
        data-theme="dark"
        style={{ background: '#0b0b0f', color: '#fff', minHeight: '60vh' }}
      >
        <Story />
      </div>
    ),
  ],
};
