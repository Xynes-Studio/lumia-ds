import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusNodeComponent } from './StatusNodeComponent';
import { vi, describe, beforeEach, it, expect } from 'vitest';

// Mock the StatusNodePopover
vi.mock('./StatusNodePopover', () => ({
  StatusNodePopover: ({
    nodeKey,
    text,
    color,
  }: {
    nodeKey: string;
    text: string;
    color: string;
  }) => (
    <div
      data-testid="status-popover"
      data-node-key={nodeKey}
      data-text={text}
      data-color={color}
    >
      Status: {text}
    </div>
  ),
}));

describe('StatusNodeComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders StatusNodePopover with correct props', () => {
    render(
      <StatusNodeComponent nodeKey="status-123" text="Done" color="success" />,
    );

    const popover = screen.getByTestId('status-popover');
    expect(popover).toBeInTheDocument();
    expect(popover).toHaveAttribute('data-node-key', 'status-123');
    expect(popover).toHaveAttribute('data-text', 'Done');
    expect(popover).toHaveAttribute('data-color', 'success');
  });

  it('passes different text values correctly', () => {
    const { rerender } = render(
      <StatusNodeComponent
        nodeKey="status-1"
        text="In Progress"
        color="info"
      />,
    );

    expect(screen.getByText('Status: In Progress')).toBeInTheDocument();

    rerender(
      <StatusNodeComponent nodeKey="status-1" text="Blocked" color="error" />,
    );

    expect(screen.getByText('Status: Blocked')).toBeInTheDocument();
  });

  it('supports all color variants', () => {
    const colors = ['info', 'success', 'warning', 'error'] as const;

    colors.forEach((color) => {
      const { unmount } = render(
        <StatusNodeComponent
          nodeKey={`status-${color}`}
          text="Test"
          color={color}
        />,
      );

      const popover = screen.getByTestId('status-popover');
      expect(popover).toHaveAttribute('data-color', color);

      unmount();
    });
  });
});
