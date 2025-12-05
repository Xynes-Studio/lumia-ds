import React, { useCallback, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  $getSelection,
  $isRangeSelection,
  KEY_MODIFIER_COMMAND,
} from 'lexical';
import { mergeRegister } from '@lexical/utils';
import {
  Button,
  Toolbar as LumiaToolbar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Input,
} from '@lumia/components';
import { Bold, Italic, Underline, Code, Link as LinkIcon, Trash2, ExternalLink } from 'lucide-react';
import { TOGGLE_LINK_COMMAND, $isLinkNode } from '@lexical/link';

export function Toolbar() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    setIsEditable(editor.isEditable());
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsCode(selection.hasFormat('code'));

      // Check for link
      const node = selection.getNodes().find((n) => $isLinkNode(n));
      const parent = selection.anchor.getNode().getParent();
      if ($isLinkNode(parent)) {
        setIsLink(true);
        setLinkUrl(parent.getURL());
      } else if ($isLinkNode(node)) {
        setIsLink(true);
        setLinkUrl(node.getURL());
      } else {
        setIsLink(false);
        setLinkUrl('');
      }
    }
  }, []);

  const insertLink = useCallback(() => {
    if (!isLink) {
      setLinkUrl('');
      setIsPopoverOpen(true);
    } else {
      // If it's already a link, we want to edit it, so we open the popover with current URL
      // The URL is already set in updateToolbar
      setIsPopoverOpen(true);
    }
  }, [isLink]);

  const onLinkSubmit = useCallback(() => {
    if (linkUrl) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
      setIsPopoverOpen(false);
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      setIsPopoverOpen(false);
    }
  }, [editor, linkUrl]);

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
      editor.registerCommand(
        KEY_MODIFIER_COMMAND,
        (payload) => {
          const event = payload as KeyboardEvent;
          if (event.key === 'k') {
            event.preventDefault();
            insertLink();
            return true;
          }
          return false;
        },
        1,
      ),
    );
  }, [editor, updateToolbar, insertLink]);

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
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={isLink ? 'secondary' : 'ghost'}
              size="icon"
              onClick={insertLink}
              onMouseDown={(e) => e.preventDefault()}
              disabled={!isEditable}
              aria-label="Insert Link"
              title="Link"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3" align="start" side="bottom">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      onLinkSubmit();
                    }
                  }}
                  autoFocus
                />
                <Button onClick={onLinkSubmit} size="sm">
                  Save
                </Button>
              </div>
              {isLink && (
                <div className="flex justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
                      setIsPopoverOpen(false);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove Link
                  </Button>
                  {linkUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        window.open(linkUrl, '_blank');
                      }}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open Link
                    </Button>
                  )}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </LumiaToolbar>
  );
}
