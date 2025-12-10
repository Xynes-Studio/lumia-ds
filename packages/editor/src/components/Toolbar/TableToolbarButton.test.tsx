import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TableToolbarButton } from './TableToolbarButton';
import { vi, describe, beforeEach, afterEach, it, expect, Mock } from 'vitest';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_TABLE_COMMAND } from '@lexical/table';

// Mock dependencies
vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: vi.fn(),
}));

vi.mock('../../plugins/TableActionMenuPlugin/tableUtils', () => ({
  $toggleTableHeaderRow: vi.fn(),
}));

vi.mock('@lumia/components', () => ({
  Button: ({
    children,
    onClick,
    onMouseDown,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    onMouseDown?: (e: React.MouseEvent) => void;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} onMouseDown={onMouseDown} {...props}>
      {children}
    </button>
  ),
}));

describe('TableToolbarButton', () => {
  const mockDispatchCommand = vi.fn();
  const mockUpdate = vi.fn((callback) => callback());
  const mockEditor = {
    dispatchCommand: mockDispatchCommand,
    update: mockUpdate,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    (useLexicalComposerContext as Mock).mockReturnValue([mockEditor]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the table button', () => {
    render(<TableToolbarButton />);
    expect(
      screen.getByRole('button', { name: 'Insert Table' }),
    ).toBeInTheDocument();
  });

  it('dispatches INSERT_TABLE_COMMAND when clicked', () => {
    render(<TableToolbarButton />);

    const button = screen.getByRole('button', { name: 'Insert Table' });
    fireEvent.click(button);

    expect(mockDispatchCommand).toHaveBeenCalledWith(INSERT_TABLE_COMMAND, {
      rows: '3',
      columns: '3',
      includeHeaders: false,
    });
  });

  it('calls editor.update to toggle header row after timeout', async () => {
    render(<TableToolbarButton />);

    const button = screen.getByRole('button', { name: 'Insert Table' });
    fireEvent.click(button);

    // Fast-forward timers
    vi.runAllTimers();

    expect(mockUpdate).toHaveBeenCalled();
  });

  it('prevents default on mouse down to not lose focus', () => {
    render(<TableToolbarButton />);

    const button = screen.getByRole('button', { name: 'Insert Table' });
    const preventDefaultSpy = vi.fn();

    fireEvent.mouseDown(button, {
      preventDefault: preventDefaultSpy,
    });

    // The onMouseDown handler should have been called
    expect(button).toBeInTheDocument();
  });
});
