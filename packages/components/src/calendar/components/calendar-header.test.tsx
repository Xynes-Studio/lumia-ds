import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CalendarHeader } from './calendar-header';

// Mock Popover components since they might require context/dom structure
vi.mock('../../popover/popover', () => ({
  Popover: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open: boolean;
  }) => (
    <div>
      {open ? 'Open' : 'Closed'}
      {children}
    </div>
  ),
  PopoverContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-content">{children}</div>
  ),
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-trigger">{children}</div>
  ),
}));

describe('CalendarHeader', () => {
  const defaultProps = {
    month: new Date(2023, 9, 15), // Oct 2023
    onPrevMonth: vi.fn(),
    onNextMonth: vi.fn(),
    onMonthChange: vi.fn(),
    onYearChange: vi.fn(),
  };

  it('renders current month and year', () => {
    render(<CalendarHeader {...defaultProps} />);
    expect(screen.getByText('October')).toBeDefined();
    // There might be multiple "2023" (header and selector), so allow multiple
    const years = screen.getAllByText('2023');
    expect(years.length).toBeGreaterThan(0);
  });

  it('calls onPrevMonth when previous button clicked', () => {
    render(<CalendarHeader {...defaultProps} />);
    const prevBtn = screen.getByLabelText('Previous Month');
    fireEvent.click(prevBtn);
    expect(defaultProps.onPrevMonth).toHaveBeenCalled();
  });

  it('calls onNextMonth when next button clicked', () => {
    render(<CalendarHeader {...defaultProps} />);
    const nextBtn = screen.getByLabelText('Next Month');
    fireEvent.click(nextBtn);
    expect(defaultProps.onNextMonth).toHaveBeenCalled();
  });
});
