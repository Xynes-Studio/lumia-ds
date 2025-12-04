import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { FileUpload } from './file-upload';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('FileUpload', () => {
  it('renders selected files with names and sizes', async () => {
    const { root, host } = createTestRoot();
    const files = [
      { name: 'report.pdf', size: 2048 },
      { name: 'logo.png', size: 1536 },
    ];

    await act(async () => {
      root.render(<FileUpload files={files} onChange={() => {}} />);
    });

    expect(host.textContent).toContain('report.pdf');
    expect(host.textContent).toContain('logo.png');
    expect(host.textContent).toContain('2 KB');
    expect(host.textContent).toContain('1.5 KB');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('invokes onChange when new files are chosen', async () => {
    const { root, host } = createTestRoot();
    const handleChange = vi.fn();

    await act(async () => {
      root.render(<FileUpload files={[]} onChange={handleChange} multiple />);
    });

    const input = host.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    await act(async () => {
      Object.defineProperty(input, 'files', {
        value: dataTransfer.files,
        writable: false,
      });
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(handleChange).toHaveBeenCalledWith([file]);
    expect(input.value).toBe('');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('removes files via the remove control', async () => {
    const { root, host } = createTestRoot();
    const handleChange = vi.fn();
    const files = [{ name: 'contract.docx', size: 4096 }];

    await act(async () => {
      root.render(<FileUpload files={files} onChange={handleChange} />);
    });

    const removeButton = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent === 'Remove',
    );
    expect(removeButton).toBeDefined();

    await act(async () => {
      removeButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(handleChange).toHaveBeenCalledWith([]);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
