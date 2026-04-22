import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { StatusNodePopover } from './StatusNodePopover';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { $getNodeByKey } from 'lexical';

vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: vi.fn(),
}));

vi.mock('@lexical/react/useLexicalNodeSelection', () => ({
  useLexicalNodeSelection: vi.fn(),
}));

vi.mock('lexical', () => ({
  $getNodeByKey: vi.fn(),
}));

vi.mock('@lumia-ui/components', () => ({
  Popover: ({
    children,
    open,
    onOpenChange,
  }: {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) => (
    <div data-testid="popover" data-open={open}>
      <button onClick={() => onOpenChange(false)}>Close popover</button>
      {children}
    </div>
  ),
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PopoverContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Input: (props: React.ComponentProps<'input'>) => <input {...props} />,
  StatusPill: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

vi.mock('./StatusNode', () => ({
  $isStatusNode: vi.fn(() => true),
}));

describe('StatusNodePopover unit', () => {
  const setSelected = vi.fn();
  const clearSelection = vi.fn();
  const setText = vi.fn();
  const setColor = vi.fn();
  const node = {
    setText,
    setColor,
  };
  const editor = {
    update: vi.fn((callback: () => void) => callback()),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    (useLexicalComposerContext as Mock).mockReturnValue([editor]);
    (useLexicalNodeSelection as Mock).mockReturnValue([
      false,
      setSelected,
      clearSelection,
    ]);
    ($getNodeByKey as Mock).mockReturnValue(node);
  });

  it('opens the popover and selects the node when the pill is clicked', () => {
    render(
      <StatusNodePopover nodeKey="status-node" text="Draft" color="info" />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Draft' }));

    expect(clearSelection).toHaveBeenCalled();
    expect(setSelected).toHaveBeenCalledWith(true);
    expect(screen.getByTestId('popover')).toHaveAttribute('data-open', 'true');
  });

  it('opens from keyboard activation and allows closing through Popover state changes', () => {
    render(
      <StatusNodePopover nodeKey="status-node" text="Draft" color="info" />,
    );

    fireEvent.keyDown(screen.getByRole('button', { name: 'Draft' }), {
      key: 'Enter',
    });
    expect(screen.getByTestId('popover')).toHaveAttribute('data-open', 'true');

    fireEvent.click(screen.getByText('Close popover'));
    expect(screen.getByTestId('popover')).toHaveAttribute('data-open', 'false');
  });

  it('debounces text updates to the status node', () => {
    render(
      <StatusNodePopover nodeKey="status-node" text="Draft" color="info" />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Draft' }));
    fireEvent.change(screen.getByPlaceholderText('Status label'), {
      target: { value: 'Published' },
    });

    expect(setText).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(setText).toHaveBeenCalledWith('Published');
  });

  it('updates the node color and syncs local text when props change', () => {
    const { rerender } = render(
      <StatusNodePopover nodeKey="status-node" text="Draft" color="info" />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Draft' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Set status color to Error' }),
    );

    expect(setColor).toHaveBeenCalledWith('error');

    rerender(
      <StatusNodePopover nodeKey="status-node" text="Review" color="warning" />,
    );

    expect(screen.getByDisplayValue('Review')).toBeInTheDocument();
  });
});
