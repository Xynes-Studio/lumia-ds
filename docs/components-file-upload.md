# FileUpload (DS-1007)

Button-driven file picker with a controlled list of selected files.

## Exports
- `FileUpload`, `type FileUploadProps`, `type UploadedFile` from `@lumia/components`.

## Props
- `files: (File | UploadedFile)[]` — controlled list; accepts raw `File` objects or existing uploads with `name` and `size`.
- `onChange(files)` — called with the next list after selection or removal.
- `multiple?: boolean` — allow selecting more than one file (default `false`).
- `accept?: string` — file types passed to the input (e.g., `".pdf,.png"`).
- `buttonLabel?: string` — overrides the upload button text (`Upload file(s)` by default).
- `emptyLabel?: string` — message when no files are present (`"No files selected"` by default).
- `className?: string` — optional wrapper class.

## Usage
```tsx
import { useState } from 'react';
import { FileUpload, type UploadedFile } from '@lumia/components';

const seededFiles: UploadedFile[] = [
  { name: 'proposal.pdf', size: 182_000 },
  { name: 'logo.png', size: 68_420 },
];

export function Attachments() {
  const [files, setFiles] = useState<(File | UploadedFile)[]>(seededFiles);

  return (
    <FileUpload
      files={files}
      multiple
      accept=".pdf,.png,.jpg"
      onChange={setFiles}
      buttonLabel="Add attachments"
    />
  );
}
```

## Notes
- Fully controlled: the component only renders `files` it receives; selection/removal flows through `onChange`.
- Sizes are displayed in human-readable units; unknown sizes default to `0 B`.
- Remove control is per-file; use `multiple={false}` to keep only the most recently chosen file.
- Built on the shared Button (shadcn-style) to match DS focus rings and tokens.
