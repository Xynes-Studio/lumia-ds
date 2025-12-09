import React from 'react';
import { render, screen } from '@testing-library/react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { EditorToolbarCompact } from './EditorToolbarCompact';
import { EditorProvider } from '../EditorProvider';
import { vi, describe, it, expect } from 'vitest';

// Mock @lumia/icons Icon component
vi.mock('@lumia/icons', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: ({ name }: any) => <span data-testid={`icon-${name}`} />,
}));

// Mock @lumia/components
vi.mock('@lumia/components', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Toolbar: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Popover: ({ children, open }: any) => (
    <div data-testid="popover" data-open={open}>
      {children}
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PopoverTrigger: ({ children }: any) => <div>{children}</div>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PopoverContent: ({ children }: any) => <div>{children}</div>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Input: (props: any) => <input {...props} />,
}));

describe('EditorToolbarCompact', () => {
  const initialConfig = {
    namespace: 'TestEditor',
    onError: (error: Error) => {
      throw error;
    },
  };

  const TestEditor = () => (
    <LexicalComposer initialConfig={initialConfig}>
      <EditorProvider>
        <EditorToolbarCompact />
      </EditorProvider>
    </LexicalComposer>
  );

  it('renders essential buttons', () => {
    render(<TestEditor />);

    expect(screen.getByLabelText('Format Bold')).toBeInTheDocument();
    expect(screen.getByLabelText('Format Italics')).toBeInTheDocument();
    expect(screen.getByLabelText('Format Underline')).toBeInTheDocument();
    expect(screen.getByLabelText('Bullet List')).toBeInTheDocument();
    expect(screen.getByLabelText('Insert Link')).toBeInTheDocument();
  });

  it('does not render block type or font controls', () => {
    render(<TestEditor />);

    expect(screen.queryByLabelText('Block Type')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Font...')).not.toBeInTheDocument();
  });
});
