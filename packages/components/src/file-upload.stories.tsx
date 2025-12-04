/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import type { FileUploadProps, UploadedFile } from './file-upload';
import { FileUpload } from './file-upload';

const meta = {
  title: 'Components/FileUpload',
  component: FileUpload,
  tags: ['autodocs'],
  argTypes: {
    files: { control: false },
    onChange: { control: false },
    multiple: { control: 'boolean' },
    accept: { control: 'text' },
  },
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof FileUpload>;

const defaultFiles: UploadedFile[] = [
  { name: 'brand-guidelines.pdf', size: 234_567 },
  { name: 'logo.png', size: 52_198 },
];

export const Playground: Story = {
  args: {
    files: defaultFiles,
    multiple: true,
    accept: '.pdf,.png,.jpg,.jpeg',
  },
  render: (args: FileUploadProps) => {
    const [files, setFiles] = useState<(File | UploadedFile)[]>(
      args.files ?? [],
    );

    return (
      <div className="space-y-4">
        <FileUpload {...args} files={files} onChange={setFiles} />
        <p className="text-sm text-muted">
          Drag files into the dashed area or click the button to pick them. The
          list below stays in sync with the controlled `files` prop so consumers
          can handle uploads however they like.
        </p>
      </div>
    );
  },
};

export const ImagesOnly: Story = {
  args: {
    files: [
      {
        name: 'welcome-banner.png',
        size: 72_400,
        previewUrl:
          'https://dummyimage.com/320x180/121417/ffffff.png&text=Welcome+Banner',
      },
    ],
    multiple: true,
    accept: 'image/*',
    buttonLabel: 'Add images',
  },
  render: (args: FileUploadProps) => {
    const [files, setFiles] = useState<(File | UploadedFile)[]>(
      args.files ?? [],
    );

    return (
      <div className="space-y-3">
        <FileUpload {...args} files={files} onChange={setFiles} />
        <p className="text-xs text-muted">
          Drag over the zone to see the highlight, or drop screenshots to
          preview them instantly.
        </p>
      </div>
    );
  },
};
