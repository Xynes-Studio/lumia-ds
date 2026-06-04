/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';

import { MarketingFigureCard } from './marketing-figure-card';

const meta = {
  title: 'Marketing/MarketingFigureCard',
  component: MarketingFigureCard,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MarketingFigureCard>;

export default meta;
type Story = StoryObj<typeof MarketingFigureCard>;

export const Default: Story = {
  args: {
    src: 'https://placehold.co/1024x512/png',
    alt: 'Architecture diagram',
    caption: 'Figure 1. Storage data path.',
    width: 1024,
    height: 512,
    allowedOrigins: ['placehold.co'],
  },
};

export const Decorative: Story = {
  args: {
    src: 'https://placehold.co/600x300/png',
    alt: '',
    decorative: true,
    allowedOrigins: ['placehold.co'],
  },
};
