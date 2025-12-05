import type { Meta, StoryObj } from '@storybook/react';
import { VideoBlockComponent } from './VideoBlockComponent';
import { EditorProvider } from '../../EditorProvider';

const meta: Meta<typeof VideoBlockComponent> = {
  title: 'Editor/Nodes/VideoBlockComponent',
  component: VideoBlockComponent,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <EditorProvider>
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
