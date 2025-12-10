import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PanelToolbarButton } from './PanelToolbarButton';
import { vi, describe, beforeEach, it, expect, Mock } from 'vitest';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_PANEL_COMMAND } from '../../plugins/InsertPanelPlugin';

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
  Popover: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open?: boolean;
  }) => (
    <div data-testid="popover" data-open={open}>
      {children}
    </div>
  ),
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-trigger">{children}</div>
  ),
  PopoverContent: ({
    children,
  }: {
    children: React.ReactNode;
    className?: string;
    align?: string;
  }) => <div data-testid="popover-content">{children}</div>,
}));

describe('PanelToolbarButton', () => {
  const mockDispatchCommand = vi.fn();
  const mockEditor = {
    dispatchCommand: mockDispatchCommand,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useLexicalComposerContext as Mock).mockReturnValue([mockEditor]);
  });

  it('renders the panel button', () => {
    render(<PanelToolbarButton />);
    expect(
      screen.getByRole('button', { name: 'Insert Panel' }),
    ).toBeInTheDocument();
  });

  it('renders all panel variant options', () => {
    render(<PanelToolbarButton />);

    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Note')).toBeInTheDocument();
  });

  it('dispatches INSERT_PANEL_COMMAND when Info variant is clicked', () => {
    render(<PanelToolbarButton />);

    fireEvent.click(screen.getByText('Info'));

    expect(mockDispatchCommand).toHaveBeenCalledWith(INSERT_PANEL_COMMAND, {
      variant: 'info',
      title: 'Info',
    });
  });

  it('dispatches INSERT_PANEL_COMMAND when Warning variant is clicked', () => {
    render(<PanelToolbarButton />);

    fireEvent.click(screen.getByText('Warning'));

    expect(mockDispatchCommand).toHaveBeenCalledWith(INSERT_PANEL_COMMAND, {
      variant: 'warning',
      title: 'Warning',
    });
  });

  it('dispatches INSERT_PANEL_COMMAND when Success variant is clicked', () => {
    render(<PanelToolbarButton />);

    fireEvent.click(screen.getByText('Success'));

    expect(mockDispatchCommand).toHaveBeenCalledWith(INSERT_PANEL_COMMAND, {
      variant: 'success',
      title: 'Success',
    });
  });

  it('dispatches INSERT_PANEL_COMMAND when Note variant is clicked', () => {
    render(<PanelToolbarButton />);

    fireEvent.click(screen.getByText('Note'));

    expect(mockDispatchCommand).toHaveBeenCalledWith(INSERT_PANEL_COMMAND, {
      variant: 'note',
      title: 'Note',
    });
  });
});
