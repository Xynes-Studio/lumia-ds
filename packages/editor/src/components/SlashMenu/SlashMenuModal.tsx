/**
 * SlashMenuModal - Modal component for media insertion from slash menu.
 * Extracted from SlashMenuPlugin for modularity and testability.
 */
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MediaInsertTabs } from '../MediaInsert';

export type SlashMenuModalType = 'media-image' | 'media-video' | 'media-file';

export interface SlashMenuModalProps {
  isOpen: boolean;
  type: SlashMenuModalType | null;
  position: { top: number; left: number };
  onInsertImageFromUrl: (url: string, metadata?: { alt?: string }) => void;
  onInsertImageFromFile: (file: File) => void;
  onInsertVideoFromUrl: (url: string) => void;
  onInsertVideoFromFile: (file: File) => void;
  onInsertFileFromUrl: (url: string) => void;
  onInsertFileFromFile: (file: File) => void;
  onClose: () => void;
}

const modalContainerStyle = (position: {
  top: number;
  left: number;
}): React.CSSProperties => ({
  position: 'fixed',
  top: position.top,
  left: position.left,
  zIndex: 1000,
});

/**
 * Renders the appropriate media insert modal based on type.
 */
export function SlashMenuModal({
  isOpen,
  type,
  position,
  onInsertImageFromUrl,
  onInsertImageFromFile,
  onInsertVideoFromUrl,
  onInsertVideoFromFile,
  onInsertFileFromUrl,
  onInsertFileFromFile,
  onClose,
}: SlashMenuModalProps): React.ReactElement | null {
  const modalRef = useRef<HTMLDivElement>(null);

  // BUG-LDS-5 / Bug B: Esc key + outside-click dismissal so a stale modal
  // doesn't survive into the next slash-menu session. Without this the only
  // dismissal path was the in-form Cancel button.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };
    const handleMouseDown = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    // Use capture for keydown so we win against editor-level handlers.
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !type) {
    return null;
  }

  const renderModalContent = () => {
    switch (type) {
      case 'media-image':
        return (
          <MediaInsertTabs
            mediaType="image"
            onInsertFromUrl={onInsertImageFromUrl}
            onInsertFromFile={onInsertImageFromFile}
            onCancel={onClose}
            showAltText={true}
          />
        );
      case 'media-video':
        return (
          <MediaInsertTabs
            mediaType="video"
            onInsertFromUrl={onInsertVideoFromUrl}
            onInsertFromFile={onInsertVideoFromFile}
            onCancel={onClose}
            urlPlaceholder="https://youtube.com/watch?v=..."
          />
        );
      case 'media-file':
        return (
          <MediaInsertTabs
            mediaType="file"
            onInsertFromUrl={onInsertFileFromUrl}
            onInsertFromFile={onInsertFileFromFile}
            onCancel={onClose}
            urlPlaceholder="https://example.com/document.pdf"
          />
        );
      default:
        return null;
    }
  };

  return createPortal(
    <div
      ref={modalRef}
      className="slash-menu-modal"
      style={modalContainerStyle(position)}
      data-testid="slash-menu-modal"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-background border border-border rounded-lg shadow-lg p-4">
        {renderModalContent()}
      </div>
    </div>,
    document.body,
  );
}
