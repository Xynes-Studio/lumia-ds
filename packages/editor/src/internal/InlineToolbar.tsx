import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  LexicalEditor,
} from 'lexical';
import { Button, Toolbar as LumiaToolbar } from '@lumia-ui/components';
import { Icon } from '@lumia-ui/icons';
import { mergeRegister } from '@lexical/utils';

const LOW_PRIORITY = 1;

function FloatingToolbar({
  editor,
}: {
  editor: LexicalEditor;
  anchorElem?: HTMLElement;
}) {
  const popupCharStylesEditorRef = useRef<HTMLDivElement | null>(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        LOW_PRIORITY,
      ),
    );
  }, [editor, updateToolbar]);

  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    display: 'none',
  });

  useEffect(() => {
    const updatePosition = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setPosition({ ...position, display: 'none' });
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setPosition({
        top: rect.top - 40 + window.scrollY,
        left: rect.left + window.scrollX,
        display: 'flex',
      });
    };

    document.addEventListener('selectionchange', updatePosition);
    return () => {
      document.removeEventListener('selectionchange', updatePosition);
    };
  }, [editor]);

  if (position.display === 'none') return null;

  return createPortal(
    <div
      className="absolute z-50 rounded-md border border-border bg-white p-1 shadow-md"
      style={{
        top: position.top,
        left: position.left,
        display: position.display,
      }}
      ref={popupCharStylesEditorRef}
    >
      <LumiaToolbar gap="sm">
        <Button
          variant={isBold ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
          }}
        >
          <Icon name="bold" size="sm" />
        </Button>
        <Button
          variant={isItalic ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
          }}
        >
          <Icon name="italic" size="sm" />
        </Button>
      </LumiaToolbar>
    </div>,
    document.body,
  );
}

export function InlineToolbar() {
  const [editor] = useLexicalComposerContext();
  return <FloatingToolbar editor={editor} anchorElem={document.body} />;
}
