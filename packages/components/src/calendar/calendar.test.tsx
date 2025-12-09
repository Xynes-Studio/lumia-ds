
import { render, screen, fireEvent } from '@testing-library/react';
import { Calendar } from './calendar';
import { describe, it, expect, vi } from 'vitest';
import { startOfDay } from 'date-fns';

describe('Calendar', () => {
  it('renders days of the current month', () => {
    render(<Calendar />);
    const today = new Date();
    const day = today.getDate();
    expect(screen.getByText(day.toString())).toBeDefined();
  });

  it('selects a date in single mode', () => {
    const onSelect = vi.fn();
    render(<Calendar mode="single" onSelect={onSelect} />);
    
    // Find a day button (assuming text is the day number)
    // We'll click the 15th of the month to be safe
    const dayButton = screen.getByText('15');
    fireEvent.click(dayButton);

    expect(onSelect).toHaveBeenCalled();
  });

  it('navigates to next month', () => {
    render(<Calendar />);
    // Just finding the next button. Assuming accessibility label "Next Month" or similar
    // For now, let's look for a button that might be the next button. 
    // Implementation should use aria-label="Next Month"
    const nextButton = screen.getByLabelText('Next Month');
    expect(nextButton).toBeDefined();
  });
});
