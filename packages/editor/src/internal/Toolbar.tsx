import React, { useCallback, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  $getSelection,
  $isRangeSelection,
} from 'lexical';
import { mergeRegister } from '@lexical/utils';
import { Button, Toolbar as LumiaToolbar } from '@lumia/components';
import { Bold, Italic, Underline, Code } from 'lucide-react';

export function Toolbar() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isCode, setIsCode] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsCode(selection.hasFormat('code'));
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
        1,
      ),
    );
  }, [editor, updateToolbar]);

  return (
    <LumiaToolbar className="border-b border-border p-2" align="start" gap="sm">
      <div className="flex gap-1">
        <Button
          variant={isBold ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
          }}
          onMouseDown={(e) => e.preventDefault()}
          aria-label="Format Bold"
          title="Bold (Cmd+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant={isItalic ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
          }}
          onMouseDown={(e) => e.preventDefault()}
          aria-label="Format Italics"
          title="Italic (Cmd+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant={isUnderline ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
          }}
          onMouseDown={(e) => e.preventDefault()}
          aria-label="Format Underline"
          title="Underline (Cmd+U)"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          variant={isCode ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
          }}
          onMouseDown={(e) => e.preventDefault()}
          aria-label="Format Code"
          title="Code"
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>
    </LumiaToolbar>
  );
}
