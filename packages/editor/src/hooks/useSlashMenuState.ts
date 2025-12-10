import { useState, useCallback } from 'react';
import {
  SlashMenuState,
  ModalState,
  initialSlashMenuState,
  initialModalState,
} from '../utils/slashMenuUtils';

export interface UseSlashMenuStateReturn {
  menuState: SlashMenuState;
  modalState: ModalState;
  openMenu: (
    position: { top: number; left: number },
    nodeKey: string,
    offset: number,
  ) => void;
  closeMenu: () => void;
  updateQuery: (query: string) => void;
  openModal: (type: string, position: { top: number; left: number }) => void;
  closeModal: () => void;
}

/**
 * Hook to manage slash menu and modal state.
 * Extracts state logic from SlashMenuPlugin for testability.
 */
export function useSlashMenuState(): UseSlashMenuStateReturn {
  const [menuState, setMenuState] = useState<SlashMenuState>(
    initialSlashMenuState,
  );
  const [modalState, setModalState] = useState<ModalState>(initialModalState);

  const openMenu = useCallback(
    (
      position: { top: number; left: number },
      nodeKey: string,
      offset: number,
    ) => {
      setMenuState({
        isOpen: true,
        query: '',
        position,
        triggerNodeKey: nodeKey,
        triggerOffset: offset,
      });
    },
    [],
  );

  const closeMenu = useCallback(() => {
    setMenuState(initialSlashMenuState);
  }, []);

  const updateQuery = useCallback((query: string) => {
    setMenuState((prev) => ({ ...prev, query }));
  }, []);

  const openModal = useCallback(
    (type: string, position: { top: number; left: number }) => {
      setModalState({
        isOpen: true,
        type,
        position,
      });
    },
    [],
  );

  const closeModal = useCallback(() => {
    setModalState(initialModalState);
  }, []);

  return {
    menuState,
    modalState,
    openMenu,
    closeMenu,
    updateQuery,
    openModal,
    closeModal,
  };
}
