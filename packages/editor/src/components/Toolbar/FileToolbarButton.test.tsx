import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileToolbarButton } from './FileToolbarButton';
import { vi, describe, beforeEach, it, expect, Mock } from 'vitest';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_FILE_BLOCK_COMMAND } from '../../plugins/InsertFilePlugin';

// Mock dependencies
vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: vi.fn(),
}));

vi.mock('@lumia/components', () => ({
  Button: ({
    children,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

describe('FileToolbarButton', () => {
  const mockDispatchCommand = vi.fn();
  const mockEditor = {
    dispatchCommand: mockDispatchCommand,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useLexicalComposerContext as Mock).mockReturnValue([mockEditor]);
  });

  it('renders the file button', () => {
    render(<FileToolbarButton />);
    expect(
      screen.getByRole('button', { name: 'Insert File' }),
    ).toBeInTheDocument();
  });

  it('opens file input when button is clicked', () => {
    render(<FileToolbarButton />);

    const button = screen.getByRole('button', { name: 'Insert File' });
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    const clickSpy = vi.spyOn(fileInput, 'click');
    fireEvent.click(button);

    expect(clickSpy).toHaveBeenCalled();
  });

  it('dispatches INSERT_FILE_BLOCK_COMMAND when file is selected', () => {
    render(<FileToolbarButton />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const testFile = new File(['test content'], 'test.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(fileInput, { target: { files: [testFile] } });

    expect(mockDispatchCommand).toHaveBeenCalledWith(
      INSERT_FILE_BLOCK_COMMAND,
      {
        url: '',
        filename: 'test.pdf',
        size: testFile.size,
        mime: 'application/pdf',
        file: testFile,
      },
    );
  });

  it('resets file input after file selection', () => {
    render(<FileToolbarButton />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });

    fireEvent.change(fileInput, { target: { files: [testFile] } });

    expect(fileInput.value).toBe('');
  });

  it('does not dispatch command when no file is selected', () => {
    render(<FileToolbarButton />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [] } });

    expect(mockDispatchCommand).not.toHaveBeenCalled();
  });
});
