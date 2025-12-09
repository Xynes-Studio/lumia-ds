import { render, screen, fireEvent } from '@testing-library/react';
import { Calendar } from '../calendar';
import { describe, it, expect, vi } from 'vitest';
import { CalendarHeader } from './components/calendar-header';

describe('Calendar Interactions & Coverage', () => {
  it('navigates months via header buttons', () => {
    render(<Calendar mode="single" />);
    const prevBtn = screen.getByRole('button', { name: /previous month/i });
    const nextBtn = screen.getByRole('button', { name: /next month/i });
    fireEvent.click(nextBtn);
    fireEvent.click(prevBtn);
  });

  it('interacts with year header click', () => {
    const handleYearClick = vi.fn();
    render(
      <CalendarHeader
        month={new Date(2023, 0, 1)}
        onYearChange={() => {}}
        onMonthChange={() => {}}
        onNextMonth={() => {}}
        onPrevMonth={() => {}}
        onMonthClick={() => {}}
        onYearClick={handleYearClick}
        minDate={new Date(2020, 0, 1)}
        maxDate={new Date(2025, 0, 1)}
      />,
    );

    const yearBtn = screen.getByText('2023');
    fireEvent.click(yearBtn);
    expect(handleYearClick).toHaveBeenCalled();
  });

  it('interacts with month header click', () => {
    const handleMonthClick = vi.fn();
    render(
      <CalendarHeader
        month={new Date(2023, 0, 1)} // January
        onYearChange={() => {}}
        onMonthChange={() => {}}
        onNextMonth={() => {}}
        onPrevMonth={() => {}}
        onMonthClick={handleMonthClick}
        onYearClick={() => {}}
      />,
    );
    const monthBtn = screen.getByText('January');
    fireEvent.click(monthBtn);
    expect(handleMonthClick).toHaveBeenCalled();
  });

  it('integration: switches view on month click', () => {
    render(<Calendar mode="single" defaultMonth={new Date(2023, 0, 1)} />);

    // 1. Initial State: Days view
    expect(screen.getAllByText('1')).toBeDefined(); // Day 1 exists
    expect(screen.getByText('January')).toBeDefined(); // Header

    // 2. Click Month Header
    const monthBtn = screen.getByText('January');
    fireEvent.click(monthBtn);

    // 3. Expect Month Selector (Jan, Feb, Mar...)
    const febSelectBtn = screen.getByRole('button', { name: 'Feb' });
    expect(febSelectBtn).toBeDefined();

    // Expect Navigation Disabled
    const prevBtn = screen.getByRole('button', { name: /previous month/i });
    expect(prevBtn.hasAttribute('disabled')).toBe(true);

    // 4. Click February
    fireEvent.click(febSelectBtn);

    // 5. Expect return to Days view, Month is now February
    expect(screen.queryByRole('button', { name: 'Feb' })).toBeNull(); // Selector should be gone
    // Header should say February
    expect(screen.getByText('February')).toBeDefined();
  });

  it('integration: switches view on year click', () => {
    render(<Calendar mode="single" defaultMonth={new Date(2023, 0, 1)} />);

    // 1. Click Year Header
    const yearBtn = screen.getByText('2023');
    fireEvent.click(yearBtn);

    // 2. Expect Year Selector (1900-2100 grid)
    const nextYearBtn = screen.getByRole('button', { name: '2024' });
    expect(nextYearBtn).toBeDefined();

    // Expect Navigation Disabled
    const prevBtn = screen.getByRole('button', { name: /previous month/i });
    expect(prevBtn.hasAttribute('disabled')).toBe(true);

    // 3. Click 2024
    fireEvent.click(nextYearBtn);

    // 4. Expect transition to Month View (hierarchy)
    // The previous 2024 button was the selector. The new one is the Header.
    // Ideally we check that the Year Selector container is gone, but we don't have a specific test id.
    // However, the Month Selector "Jan" button appearing is sufficient proof of transition.

    // Month selector should be present
    const janBtn = screen.getByRole('button', { name: 'Jan' });
    expect(janBtn).toBeDefined();

    // 5. Click Jan
    fireEvent.click(janBtn);

    // 6. Expect return to Date View
    expect(screen.queryByRole('button', { name: 'Jan' })).toBeNull(); // Month selector gone
    expect(screen.getByText('January')).toBeDefined();
    expect(screen.getByText('2024')).toBeDefined();
  });

  it('integration: switches between month and year views via header', () => {
    // 1. Initial State: Day View
    render(<Calendar mode="single" defaultMonth={new Date(2023, 0, 1)} />);

    // 2. Click Month Header -> Opens Month View
    fireEvent.click(screen.getByText('January'));
    expect(screen.getByRole('button', { name: 'Jan' })).toBeDefined(); // Month Selector Visible

    // 3. Verify Year Header is Enabled
    const yearBtn = screen.getByText('2023');
    expect(yearBtn.hasAttribute('disabled')).toBe(false);

    // 4. Click Year Header -> Switches to Year View
    fireEvent.click(yearBtn);
    expect(screen.getByRole('button', { name: '2024' })).toBeDefined(); // Year Selector Visible (2024 is in the grid)

    // 5. Verify Month Header is Enabled
    const monthBtn = screen.getByText('January');
    expect(monthBtn.hasAttribute('disabled')).toBe(false);

    // 6. Click Month Header -> Switches back to Month View
    fireEvent.click(monthBtn);
    expect(screen.getByRole('button', { name: 'Jan' })).toBeDefined();
  });

  it('renders custom day component via renderDay prop', () => {
    const renderDaySpy = vi.fn().mockReturnValue(<div>Custom Day</div>);
    render(
      <Calendar
        mode="single"
        defaultMonth={new Date(2023, 0, 1)}
        renderDay={renderDaySpy}
      />,
    );
    expect(renderDaySpy).toHaveBeenCalled();
    expect(screen.getAllByText('Custom Day')).toBeDefined();
  });

  it('renders fallback for unimplemented view', () => {
    // Force invalid view mode to test fallback
    // The component sets state 'view' from props 'viewMode' if provided.

    // Actually our implementation uses "view" state which defaults to 'month' or controlled viewMode.
    // Let's passed controlled props.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(<Calendar mode="single" viewMode={'invalid' as any} />);
    expect(screen.getByText('View not implemented')).toBeDefined();
  });
});
