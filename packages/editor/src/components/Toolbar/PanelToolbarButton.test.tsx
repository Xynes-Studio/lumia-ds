import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PanelToolbarButton } from './PanelToolbarButton';
import { vi, describe, beforeEach, it, expect, Mock } from 'vitest';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_PANEL_COMMAND } from '../../plugins/InsertPanelPlugin';
import {
  DEFAULT_PANEL_TITLE,
  DEFAULT_PANEL_VARIANT,
} from '../../utils/panelActionUtils';

// Mock dependencies
vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: vi.fn(),
}));

vi.mock('@lumia-ui/components', () => ({
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

vi.mock('@lumia-ui/icons', () => ({
  Icon: ({ name, ...props }: { name: string; [key: string]: unknown }) => (
    <span
      data-lumia-icon={name}
      data-testid={`lumia-icon-${name}`}
      {...props}
    />
  ),
}));

describe('PanelToolbarButton (BUG-LDS-6 unified insert)', () => {
  const mockDispatchCommand = vi.fn();
  const mockEditor = {
    dispatchCommand: mockDispatchCommand,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useLexicalComposerContext as Mock).mockReturnValue([mockEditor]);
  });

  it('renders the Insert Panel button with the Lumia layout-grid icon', () => {
    render(<PanelToolbarButton />);

    const button = screen.getByRole('button', { name: 'Insert Panel' });
    expect(button).toBeInTheDocument();
    // BUG-LDS-6 §3.1: editor icons MUST come from @lumia-ui/icons.
    expect(screen.getByTestId('lumia-icon-layout-grid')).toBeInTheDocument();
  });

  it('does NOT open a popover or modal asking which variant to use', () => {
    render(<PanelToolbarButton />);

    // No nested variant options should be visible at any point — the click
    // commits a default panel directly (see plan §3.2).
    expect(screen.queryByText('Info')).not.toBeInTheDocument();
    expect(screen.queryByText('Warning')).not.toBeInTheDocument();
    expect(screen.queryByText('Success')).not.toBeInTheDocument();
    expect(screen.queryByText('Note')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('inserts a default info panel directly on click (no modal)', () => {
    render(<PanelToolbarButton />);

    fireEvent.click(screen.getByRole('button', { name: 'Insert Panel' }));

    expect(mockDispatchCommand).toHaveBeenCalledTimes(1);
    expect(mockDispatchCommand).toHaveBeenCalledWith(INSERT_PANEL_COMMAND, {
      variant: DEFAULT_PANEL_VARIANT,
      title: DEFAULT_PANEL_TITLE,
    });
  });

  it('the default variant is "info" (matches the canonical constant)', () => {
    expect(DEFAULT_PANEL_VARIANT).toBe('info');
  });
});
