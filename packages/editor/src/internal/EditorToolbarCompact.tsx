import React from 'react';
import { FORMAT_TEXT_COMMAND } from 'lexical';
import {
  Button,
  Toolbar as LumiaToolbar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Input,
} from '@lumia/components';
import { Icon } from '@lumia/icons';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useToolbarState } from './useToolbarState';

export function EditorToolbarCompact() {
  const {
    isBold,
    isItalic,
    isUnderline,
    isLink,
    linkUrl,
    setLinkUrl,
    isPopoverOpen,
    setIsPopoverOpen,
    isEditable,
    isBulletList,
    insertLink,
    onLinkSubmit,
    toggleBulletList,
    editor,
  } = useToolbarState();

  return (
    <LumiaToolbar className="border-b border-border p-1" align="start" gap="sm">
      <div className="flex flex-wrap items-center gap-1">
        {/* Text Formatting Buttons */}
        <Button
          variant={isBold ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
          }}
          onMouseDown={(e) => e.preventDefault()}
          aria-label="Format Bold"
          title="Bold (Cmd+B)"
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
          onMouseDown={(e) => e.preventDefault()}
          aria-label="Format Italics"
          title="Italic (Cmd+I)"
        >
          <Icon name="italic" size="sm" />
        </Button>
        <Button
          variant={isUnderline ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
          }}
          onMouseDown={(e) => e.preventDefault()}
          aria-label="Format Underline"
          title="Underline (Cmd+U)"
        >
          <Icon name="underline" size="sm" />
        </Button>

        <div className="mx-1 h-4 w-px bg-border" />

        {/* List Button */}
        <Button
          variant={isBulletList ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={toggleBulletList}
          onMouseDown={(e) => e.preventDefault()}
          aria-label="Bullet List"
          title="Bullet List"
        >
          <Icon name="list" size="sm" />
        </Button>

        <div className="mx-1 h-4 w-px bg-border" />

        {/* Link Button */}
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={isLink ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={insertLink}
              onMouseDown={(e) => e.preventDefault()}
              disabled={!isEditable}
              aria-label="Insert Link"
              title="Link"
            >
              <Icon name="link" size="sm" />
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
                  aria-label="Link URL"
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
                    <Icon name="trash" size="sm" className="mr-2" />
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
                      <Icon name="external-link" size="sm" className="mr-2" />
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
