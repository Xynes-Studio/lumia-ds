import type { Meta, StoryObj } from '@storybook/react';
import { BlockOutline } from './BlockOutline';
import { EditorProvider } from '../../EditorProvider';
import { LumiaEditorPrimitive } from '../../internal/LumiaEditorPrimitive';
import { BlockInspector } from '../BlockInspector/BlockInspector';

const meta: Meta = {
  title: 'Editor/Features/BlockOutline',
  component: BlockOutline,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof BlockOutline>;

const initialValue = {
  root: {
    children: [
      {
        type: 'heading',
        tag: 'h1',
        format: '' as const,
        indent: 0,
        version: 1,
        children: [
          {
            type: 'text',
            text: 'Welcome to the Editor',
            format: 0,
            style: '',
            version: 1,
            mode: 'normal',
          },
        ],
        direction: 'ltr' as const,
      },
      {
        type: 'paragraph',
        format: '' as const,
        indent: 0,
        version: 1,
        children: [
          {
            type: 'text',
            text: 'This is a sample paragraph to demonstrate the outline.',
            format: 0,
            style: '',
            version: 1,
            mode: 'normal',
          },
        ],
        direction: 'ltr',
      },
      {
        type: 'panel-block',
        variant: 'info',
        title: 'Info Panel',
        icon: 'info',
        version: 1,
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'This is an info panel.',
                format: 0,
                style: '',
                version: 1,
                mode: 'normal',
              },
            ],
            format: '',
            indent: 0,
            version: 1,
            direction: 'ltr',
          },
        ],
        format: '' as const,
        indent: 0,
        direction: 'ltr',
      },
      {
        type: 'heading',
        tag: 'h2',
        format: '' as const,
        indent: 0,
        version: 1,
        children: [
          {
            type: 'text',
            text: 'Another Section',
            format: 0,
            style: '',
            version: 1,
            mode: 'normal',
          },
        ],
        direction: 'ltr',
      },
      {
        type: 'video-block',
        src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        provider: 'youtube',
        title: 'Demo Video',
        version: 1,
        format: '' as const,
        indent: 0,
        direction: 'ltr',
      },
      {
        type: 'paragraph',
        format: '' as const,
        indent: 0,
        version: 1,
        children: [
          {
            type: 'text',
            text: 'More content here.',
            format: 0,
            style: '',
            version: 1,
            mode: 'normal',
          },
        ],
        direction: 'ltr',
      },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    type: 'root',
    version: 1,
  },
};

export const Default: Story = {
  render: () => (
    <div className="h-screen w-full flex bg-white">
      <EditorProvider value={initialValue}>
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 h-full flex flex-col">
          <BlockOutline />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-8 bg-gray-50 flex justify-center">
          <div className="w-full max-w-3xl bg-white shadow-sm min-h-[500px] rounded-lg border border-gray-200">
            <LumiaEditorPrimitive />
          </div>
        </div>

        {/* Right Sidebar (Inspector) - Optional context */}
        <div className="w-80 border-l border-gray-200 h-full p-4 bg-white">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Inspector
          </h3>
          <BlockInspector />
        </div>
      </EditorProvider>
    </div>
  ),
};
