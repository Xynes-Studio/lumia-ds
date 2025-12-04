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
          Use the upload button to choose files. The list below stays in sync
          with the controlled `files` prop so consumers can handle uploads
          however they like.
        </p>
      </div>
    );
  },
};
