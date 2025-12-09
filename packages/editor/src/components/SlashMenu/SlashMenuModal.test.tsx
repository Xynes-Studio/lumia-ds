/**
 * Tests for SlashMenuModal component.
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { SlashMenuModal, SlashMenuModalProps } from './SlashMenuModal';

// Mock createPortal to render directly
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (element: React.ReactNode) => element,
  };
});

describe('SlashMenuModal', () => {
  const defaultProps: SlashMenuModalProps = {
    isOpen: false,
    type: null,
    position: { top: 100, left: 200 },
    onInsertImageFromUrl: vi.fn(),
    onInsertImageFromFile: vi.fn(),
    onInsertVideoFromUrl: vi.fn(),
    onInsertVideoFromFile: vi.fn(),
    onInsertFileFromUrl: vi.fn(),
    onInsertFileFromFile: vi.fn(),
    onClose: vi.fn(),
  };

  it('should not render when closed', () => {
    const { container } = render(<SlashMenuModal {...defaultProps} />);
    expect(container.querySelector('.slash-menu-modal')).toBeNull();
  });

  it('should not render when type is null', () => {
    const { container } = render(
      <SlashMenuModal {...defaultProps} isOpen={true} type={null} />,
    );
    expect(container.querySelector('.slash-menu-modal')).toBeNull();
  });

  it('should render image modal when type is media-image', () => {
    const { container } = render(
      <SlashMenuModal {...defaultProps} isOpen={true} type="media-image" />,
    );
    expect(container.querySelector('.slash-menu-modal')).not.toBeNull();
  });

  it('should render video modal when type is media-video', () => {
    const { container } = render(
      <SlashMenuModal {...defaultProps} isOpen={true} type="media-video" />,
    );
    expect(container.querySelector('.slash-menu-modal')).not.toBeNull();
  });

  it('should render file modal when type is media-file', () => {
    const { container } = render(
      <SlashMenuModal {...defaultProps} isOpen={true} type="media-file" />,
    );
    expect(container.querySelector('.slash-menu-modal')).not.toBeNull();
  });

  it('should apply correct position styles', () => {
    const { container } = render(
      <SlashMenuModal
        {...defaultProps}
        isOpen={true}
        type="media-image"
        position={{ top: 150, left: 250 }}
      />,
    );
    const modal = container.querySelector('.slash-menu-modal') as HTMLElement;
    expect(modal?.style.top).toBe('150px');
    expect(modal?.style.left).toBe('250px');
  });

  it('should have test id for testing', () => {
    const { container } = render(
      <SlashMenuModal {...defaultProps} isOpen={true} type="media-image" />,
    );
    expect(
      container.querySelector('[data-testid="slash-menu-modal"]'),
    ).not.toBeNull();
  });
});
