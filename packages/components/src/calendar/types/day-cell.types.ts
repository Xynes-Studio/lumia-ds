import React from 'react';

export interface DayCellRenderProps {
  date: Date;
  isSelected: boolean;
  isToday: boolean;
  isOutside: boolean;
  isDisabled: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isRangeMiddle: boolean;
  onClick: () => void;
}

export interface DayCellProps extends DayCellRenderProps {
  className?: string;
  children?: React.ReactNode;
}
