import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CalendarFull } from './calendar-full';
import { CalendarCompact } from './calendar-compact';
import { Calendar } from '../calendar';

vi.mock('../../segmented-control/segmented-control', () => ({
  SegmentedControl: ({ onChange }: { onChange: (v: string) => void }) => (
    <div data-testid="segmented-control">
      <button onClick={() => onChange('day')}>Day</button>
      <button onClick={() => onChange('month')}>Month</button>
    </div>
  ),
  SegmentedControlOption: () => null,
}));

describe('Calendar Variants', () => {
  describe('CalendarFull', () => {
    it('renders segmented control for view switching', () => {
      render(<CalendarFull />);
      expect(screen.getByTestId('segmented-control')).toBeDefined();
    });

    it('renders dates in month view', () => {
      render(<CalendarFull defaultMonth={new Date(2023, 9, 1)} />);
      expect(screen.getByText('15')).toBeDefined();
    });
  });

  describe('CalendarCompact', () => {
    it('renders without segmented control', () => {
      render(<CalendarCompact />);
      expect(screen.queryByTestId('segmented-control')).toBeNull();
    });

    it('renders dates', () => {
      render(<CalendarCompact defaultMonth={new Date(2023, 9, 1)} />);
      expect(screen.getByText('15')).toBeDefined();
    });
  });

  describe('Calendar Main Component', () => {
    it('renders Full variant primarily (for now)', () => {
      // In implementation we pointed both to Full logic but mapped props
      // Actually currently Calendar uses CalendarImpl which renders SegmentedControl only if variant='full'
      render(<Calendar variant="full" />);
      expect(screen.getByTestId('segmented-control')).toBeDefined();
    });

    it('renders Compact variant by default', () => {
      render(<Calendar />);
      // Default variant is compact in CalendarImpl, so no segmented control
      expect(screen.queryByTestId('segmented-control')).toBeNull();
    });
  });
});
