/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';

import { MarketingHero } from './marketing-hero';

const meta = {
  title: 'Marketing/MarketingHero',
  component: MarketingHero,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MarketingHero>;

export default meta;
type Story = StoryObj<typeof MarketingHero>;

export const Default: Story = {
  args: {
    headline: "Publish from your team's directory.",
    subhead:
      'Workspace-scoped content management built for teams. Open source, hosted in the EU.',
    primaryCta: {
      label: 'Sign up',
      href: 'https://auth.xynes.com/signup',
    },
    secondaryCta: {
      label: 'Sign in',
      href: 'https://auth.xynes.com/login',
    },
  },
};

export const WordmarkHeadline: Story = {
  args: {
    headline: 'brand',
    subhead: 'Workspace-scoped content management built for teams.',
    primaryCta: { label: 'Sign up', href: 'https://auth.xynes.com/signup' },
    secondaryCta: { label: 'Sign in', href: 'https://auth.xynes.com/login' },
  },
};

export const WithEyebrowAndFootnote: Story = {
  args: {
    eyebrow: 'Open source',
    headline: 'A CMS that respects your workspace.',
    subhead: 'Directory-first authoring. Workspace-scoped publishing.',
    primaryCta: { label: 'Sign up', href: 'https://auth.xynes.com/signup' },
    secondaryCta: {
      label: 'Read the docs',
      href: 'https://docs.example.com',
      target: '_blank',
    },
    footnote: <span>No credit card required.</span>,
  },
};

export const Minimal: Story = {
  args: {
    headline: 'Build something honest.',
    subhead: 'No tracking. No dark patterns.',
    primaryCta: { label: 'Sign up', href: '/signup' },
  },
};

export const ExtremeLongCopy: Story = {
  args: {
    headline:
      'A workspace-scoped content management system designed for teams that ship every week and need their directory structure to follow them everywhere.',
    subhead:
      'Open source, hosted in the EU, with first-class support for workspace API keys, content directories, scheduled publishing, role-based access, and an inline editor that does not assume your authors know markdown.',
    primaryCta: {
      label: 'Sign up — start a workspace and invite your team',
      href: '/signup',
    },
    secondaryCta: {
      label: 'Sign in — already have an account',
      href: '/login',
    },
  },
};

export const RTL: Story = {
  args: {
    headline: 'العنوان',
    subhead: 'وصف',
    primaryCta: { label: 'تسجيل', href: '/signup' },
  },
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};

export const Dark: Story = {
  args: {
    headline: "Publish from your team's directory.",
    subhead: 'Workspace-scoped content management for teams.',
    primaryCta: { label: 'Sign up', href: '/signup' },
    secondaryCta: { label: 'Sign in', href: '/login' },
  },
  decorators: [
    (Story) => (
      <div
        data-theme="dark"
        style={{
          background: '#0b0b0f',
          color: '#ffffff',
          minHeight: '70vh',
        }}
      >
        <Story />
      </div>
    ),
  ],
};
