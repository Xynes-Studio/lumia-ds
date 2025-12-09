import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DayCell } from './day-cell';

describe('DayCell', () => {
  const defaultProps = {
    date: new Date(2023, 9, 15),
    isSelected: false,
    isToday: false,
    isOutside: false,
    isDisabled: false,
    isRangeStart: false,
    isRangeEnd: false,
    isRangeMiddle: false,
    onClick: vi.fn(),
  };

  it('renders the day number', () => {
    render(<DayCell {...defaultProps} />);
    expect(screen.getByText('15')).toBeDefined();
  });

  it('calls onClick when clicked', () => {
    render(<DayCell {...defaultProps} />);
    fireEvent.click(screen.getByText('15'));
    expect(defaultProps.onClick).toHaveBeenCalled();
  });

  it('applies selected styles', () => {
    render(<DayCell {...defaultProps} isSelected={true} />);
    const button = screen.getByText('15').closest('button');
    expect(button?.className).toContain('bg-primary');
  });

  it('applies disabled styles and attribute', () => {
    render(<DayCell {...defaultProps} isDisabled={true} />);
    const button = screen.getByText('15').closest('button');
    expect(button).toHaveProperty('disabled', true);
  });

  it('applies range middle styles', () => {
    render(<DayCell {...defaultProps} isRangeMiddle={true} />);
    const button = screen.getByText('15').closest('button');
    expect(button?.className).toContain('bg-secondary');
  });
});
