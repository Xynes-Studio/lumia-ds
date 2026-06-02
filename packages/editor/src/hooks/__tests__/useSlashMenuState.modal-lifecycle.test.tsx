/**
 * BUG-LDS-5 / Bug B — modal lifecycle is tied to the slash-menu instance.
 *
 * Two contracts under test:
 *  1. `openMenu()` resets any stale modal so a new slash-menu session starts
 *     clean (preventing a previously-opened modal from leaking into the next
 *     session).
 *  2. `SlashMenuModal` itself responds to Esc and outside-click so the user
 *     has a dismissal path beyond the in-form Cancel button.
 */
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { useSlashMenuState } from '../useSlashMenuState';
import {
  SlashMenuModal,
  SlashMenuModalProps,
} from '../../components/SlashMenu/SlashMenuModal';

// Mock createPortal so the modal renders inline for jsdom assertions.
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (element: React.ReactNode) => element,
  };
});

afterEach(() => {
  cleanup();
});

describe('useSlashMenuState — modal cleanup on new menu open (BUG-LDS-5 / Bug B)', () => {
  it('openMenu() resets any stale modal state', () => {
    const { result } = renderHook(() => useSlashMenuState());

    // Simulate: previous slash-menu session opened an image modal.
    act(() => {
      result.current.openModal('media-image', { top: 100, left: 50 });
    });
    expect(result.current.modalState.isOpen).toBe(true);
    expect(result.current.modalState.type).toBe('media-image');

    // User types `/` somewhere else; openMenu should also reset the modal.
    act(() => {
      result.current.openMenu({ top: 300, left: 200 }, 'node-2', 0);
    });

    expect(result.current.menuState.isOpen).toBe(true);
    expect(result.current.modalState.isOpen).toBe(false);
    expect(result.current.modalState.type).toBeNull();
  });

  it('openMenu() does not clobber a modal that opened from the SAME selection', () => {
    // Behavioural detail: when the user picks "Image" from the slash menu,
    // SlashMenuPlugin calls closeMenu() then openModal(). It does NOT call
    // openMenu() again. So the cleanup we added inside openMenu only fires
    // on a NEW slash-trigger session — which is the intended semantics.
    const { result } = renderHook(() => useSlashMenuState());

    // Open menu, then open modal from a selection. The modal stays open.
    act(() => {
      result.current.openMenu({ top: 100, left: 50 }, 'node-1', 0);
    });
    act(() => {
      result.current.closeMenu();
      result.current.openModal('media-image', { top: 100, left: 50 });
    });
    expect(result.current.modalState.isOpen).toBe(true);
    expect(result.current.menuState.isOpen).toBe(false);
  });

  it('closeMenu() alone does NOT close an open modal (modal owns its own lifecycle)', () => {
    // A modal that was opened by a slash command should not be auto-dismissed
    // when the menu closes — the user is still interacting with the modal.
    const { result } = renderHook(() => useSlashMenuState());

    act(() => {
      result.current.openModal('media-image', { top: 100, left: 50 });
    });
    act(() => {
      result.current.closeMenu();
    });
    expect(result.current.modalState.isOpen).toBe(true);
  });
});

describe('SlashMenuModal — dismissal paths (BUG-LDS-5 / Bug B)', () => {
  const baseProps: SlashMenuModalProps = {
    isOpen: true,
    type: 'media-image',
    position: { top: 100, left: 50 },
    onInsertImageFromUrl: vi.fn(),
    onInsertImageFromFile: vi.fn(),
    onInsertVideoFromUrl: vi.fn(),
    onInsertVideoFromFile: vi.fn(),
    onInsertFileFromUrl: vi.fn(),
    onInsertFileFromFile: vi.fn(),
    onClose: vi.fn(),
  };

  it('closes on Escape key', () => {
    const onClose = vi.fn();
    render(<SlashMenuModal {...baseProps} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on Escape when isOpen=false', () => {
    const onClose = vi.fn();
    render(<SlashMenuModal {...baseProps} isOpen={false} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes on mousedown outside the modal', () => {
    const onClose = vi.fn();
    const { container } = render(
      <SlashMenuModal {...baseProps} onClose={onClose} />,
    );

    // The mock createPortal renders inline; click outside on document.body.
    fireEvent.mouseDown(document.body);

    expect(onClose).toHaveBeenCalledTimes(1);
    // Guard for unused-binding lints if the assertion form changes.
    expect(container).toBeTruthy();
  });

  it('does not close on mousedown inside the modal', () => {
    const onClose = vi.fn();
    const { container } = render(
      <SlashMenuModal {...baseProps} onClose={onClose} />,
    );

    const modal = container.querySelector('.slash-menu-modal') as HTMLElement;
    expect(modal).not.toBeNull();
    fireEvent.mouseDown(modal);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('exposes role=dialog + aria-modal=true for accessibility', () => {
    const { container } = render(<SlashMenuModal {...baseProps} />);
    const modal = container.querySelector('.slash-menu-modal') as HTMLElement;
    expect(modal.getAttribute('role')).toBe('dialog');
    expect(modal.getAttribute('aria-modal')).toBe('true');
  });
});
