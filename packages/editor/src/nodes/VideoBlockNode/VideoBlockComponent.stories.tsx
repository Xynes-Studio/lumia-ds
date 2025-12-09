import type { Meta, StoryObj } from '@storybook/react';
import { VideoBlockComponent } from './VideoBlockComponent';
import { EditorProvider } from '../../EditorProvider';

const meta: Meta<typeof VideoBlockComponent> = {
  title: 'Editor/Blocks/Video',
  component: VideoBlockComponent,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <EditorProvider media={{ maxFileSizeMB: 100 }}>
        <div style={{ width: '800px' }}>
          <Story />
        </div>
      </EditorProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof VideoBlockComponent>;

export const Youtube: Story = {
  args: {
    src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    provider: 'youtube',
    title: 'Rick Roll',
    nodeKey: '1',
  },
};

export const Vimeo: Story = {
  args: {
    src: 'https://player.vimeo.com/video/76979871',
    provider: 'vimeo',
    title: 'Vimeo Video',
    nodeKey: '2',
  },
};

export const HTML5: Story = {
  args: {
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    provider: 'html5',
    title: 'Flower',
    nodeKey: '3',
  },
};

export const Empty: Story = {
  args: {
    src: '',
    provider: 'html5',
    nodeKey: '4',
  },
};

export const Breakout: Story = {
  args: {
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    provider: 'html5',
    title: 'Breakout Layout',
    layout: 'breakout',
    nodeKey: '5',
  },
};

export const FullWidth: Story = {
  args: {
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    provider: 'html5',
    title: 'Full Width Layout',
    layout: 'fullWidth',
    nodeKey: '6',
  },
};

export const Resized: Story = {
  args: {
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    provider: 'html5',
    title: 'Resized Video',
    width: 400,
    nodeKey: '7',
  },
};

export const AlignedRight: Story = {
  args: {
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    provider: 'html5',
    title: 'Right Aligned',
    width: 400,
    alignment: 'right',
    nodeKey: '8',
  },
};
