import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { MediaResizer } from './MediaResizer';
import { vi, describe, beforeEach, it, expect } from 'vitest';

describe('MediaResizer', () => {
  const mockOnWidthChange = vi.fn();
  const mockEditor = {
    isEditable: vi.fn(() => true),
  };
  let mockMediaRef: React.RefObject<HTMLDivElement>;
  let mockMediaElement: HTMLDivElement;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEditor.isEditable.mockReturnValue(true);

    // Create a mock media element
    mockMediaElement = document.createElement('div');
    mockMediaElement.style.width = '500px';
    mockMediaElement.getBoundingClientRect = vi.fn(() => ({
      width: 500,
      height: 300,
      top: 0,
      left: 0,
      right: 500,
      bottom: 300,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }));

    // Create a mock ref
    mockMediaRef = {
      current: mockMediaElement,
    } as React.RefObject<HTMLDivElement>;
  });

  it('renders resize handles', () => {
    render(
      <MediaResizer
        editor={mockEditor as never}
        mediaRef={mockMediaRef as never}
        onWidthChange={mockOnWidthChange}
      />,
    );

    // Should render two handles (left and right)
    const handles = document.querySelectorAll('[class*="cursor-ew-resize"]');
    expect(handles).toHaveLength(2);
  });

  it('does not resize when editor is not editable', () => {
    mockEditor.isEditable.mockReturnValue(false);

    render(
      <MediaResizer
        editor={mockEditor as never}
        mediaRef={mockMediaRef as never}
        onWidthChange={mockOnWidthChange}
      />,
    );

    const handles = document.querySelectorAll('[class*="cursor-ew-resize"]');
    const rightHandle = handles[0] as HTMLElement;

    fireEvent.pointerDown(rightHandle, { clientX: 0 });

    // onWidthChange should not be called
    expect(mockOnWidthChange).not.toHaveBeenCalled();
  });

  it('applies resizing class when pointer is down', () => {
    render(
      <MediaResizer
        editor={mockEditor as never}
        mediaRef={mockMediaRef as never}
        onWidthChange={mockOnWidthChange}
      />,
    );

    const handles = document.querySelectorAll('[class*="cursor-ew-resize"]');
    const rightHandle = handles[0] as HTMLElement;

    fireEvent.pointerDown(rightHandle, {
      clientX: 500,
      preventDefault: vi.fn(),
    });

    // Check that the handle has the bg-primary class (indicating resizing state)
    expect(rightHandle.className).toContain('bg-primary');
  });
});
