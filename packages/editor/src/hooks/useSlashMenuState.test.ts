import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSlashMenuState } from './useSlashMenuState';

describe('useSlashMenuState', () => {
  describe('initial state', () => {
    it('initializes with menu closed', () => {
      const { result } = renderHook(() => useSlashMenuState());
      expect(result.current.menuState.isOpen).toBe(false);
      expect(result.current.menuState.query).toBe('');
    });

    it('initializes with modal closed', () => {
      const { result } = renderHook(() => useSlashMenuState());
      expect(result.current.modalState.isOpen).toBe(false);
      expect(result.current.modalState.type).toBeNull();
    });
  });

  describe('openMenu', () => {
    it('opens menu with position', () => {
      const { result } = renderHook(() => useSlashMenuState());

      act(() => {
        result.current.openMenu({ top: 100, left: 200 }, 'node-key', 5);
      });

      expect(result.current.menuState.isOpen).toBe(true);
      expect(result.current.menuState.position).toEqual({
        top: 100,
        left: 200,
      });
      expect(result.current.menuState.triggerNodeKey).toBe('node-key');
      expect(result.current.menuState.triggerOffset).toBe(5);
    });

    it('resets query when opening', () => {
      const { result } = renderHook(() => useSlashMenuState());

      act(() => {
        result.current.openMenu({ top: 0, left: 0 }, 'key', 0);
      });

      expect(result.current.menuState.query).toBe('');
    });
  });

  describe('closeMenu', () => {
    it('closes menu and resets state', () => {
      const { result } = renderHook(() => useSlashMenuState());

      act(() => {
        result.current.openMenu({ top: 100, left: 200 }, 'node-key', 5);
      });

      act(() => {
        result.current.closeMenu();
      });

      expect(result.current.menuState.isOpen).toBe(false);
      expect(result.current.menuState.triggerNodeKey).toBeNull();
    });
  });

  describe('updateQuery', () => {
    it('updates query', () => {
      const { result } = renderHook(() => useSlashMenuState());

      act(() => {
        result.current.openMenu({ top: 0, left: 0 }, 'key', 0);
      });

      act(() => {
        result.current.updateQuery('table');
      });

      expect(result.current.menuState.query).toBe('table');
    });

    it('preserves menu state when updating query', () => {
      const { result } = renderHook(() => useSlashMenuState());

      act(() => {
        result.current.openMenu({ top: 50, left: 100 }, 'node-1', 3);
      });

      act(() => {
        result.current.updateQuery('heading');
      });

      expect(result.current.menuState.isOpen).toBe(true);
      expect(result.current.menuState.position).toEqual({ top: 50, left: 100 });
      expect(result.current.menuState.triggerNodeKey).toBe('node-1');
    });
  });

  describe('openModal', () => {
    it('opens modal with type and position', () => {
      const { result } = renderHook(() => useSlashMenuState());

      act(() => {
        result.current.openModal('media-image', { top: 150, left: 250 });
      });

      expect(result.current.modalState.isOpen).toBe(true);
      expect(result.current.modalState.type).toBe('media-image');
      expect(result.current.modalState.position).toEqual({
        top: 150,
        left: 250,
      });
    });
  });

  describe('closeModal', () => {
    it('closes modal and resets state', () => {
      const { result } = renderHook(() => useSlashMenuState());

      act(() => {
        result.current.openModal('media-video', { top: 0, left: 0 });
      });

      act(() => {
        result.current.closeModal();
      });

      expect(result.current.modalState.isOpen).toBe(false);
      expect(result.current.modalState.type).toBeNull();
    });
  });
});
