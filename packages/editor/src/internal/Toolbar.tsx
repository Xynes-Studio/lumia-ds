import React from 'react';
import { FORMAT_TEXT_COMMAND } from 'lexical';
import {
  Button,
  Toolbar as LumiaToolbar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Input,
  Select,
} from '@lumia-ui/components';
import { Icon } from '@lumia-ui/icons';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { FontCombobox } from '../components/Fonts';
import { useToolbarState } from './useToolbarState';

export function Toolbar() {
  const {
    isBold,
    isItalic,
    isUnderline,
    isCode,
    isCodeBlock,
    isLink,
    linkUrl,
    setLinkUrl,
    isPopoverOpen,
    setIsPopoverOpen,
    isEditable,
    selectedFont,
    blockType,
    isBulletList,
    isNumberedList,
    fontsConfig,
    insertLink,
    onLinkSubmit,
    handleFontChange,
    handleBlockTypeChange,
    toggleBulletList,
    toggleNumberedList,
    editor,
  } = useToolbarState();

  return (
    <LumiaToolbar className="border-b border-border p-2" align="start" gap="sm">
      <div className="flex flex-wrap items-center gap-1">
        {/* Block Type Dropdown */}
        <div className="min-w-[120px]">
          <Select
            value={blockType}
            onChange={(e) => handleBlockTypeChange(e.target.value)}
            aria-label="Block Type"
          >
            <option value="paragraph">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="code">Code Block</option>
          </Select>
        </div>
        <div className="mx-2 h-6 w-px bg-border" />

        {/* Font Combobox */}
        <div className="min-w-[160px]">
          <FontCombobox
            config={fontsConfig}
            value={selectedFont}
            onChange={handleFontChange}
            placeholder={selectedFont === '' ? 'Mixed' : 'Font...'}
          />
        </div>
        <div className="mx-2 h-6 w-px bg-border" />

        {/* Text Formatting Buttons */}
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
          <Icon name="bold" size="sm" />
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
          <Icon name="italic" size="sm" />
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
          <Icon name="underline" size="sm" />
        </Button>
        <Button
          variant={isCode ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
          }}
          onMouseDown={(e) => e.preventDefault()}
          aria-label="Format Code"
          title="Inline Code"
        >
          <Icon name="code" size="sm" />
        </Button>
        <Button
          variant={isCodeBlock ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() =>
            handleBlockTypeChange(isCodeBlock ? 'paragraph' : 'code')
          }
          onMouseDown={(e) => e.preventDefault()}
          aria-label="Format Code Block"
          title="Code Block"
        >
          <Icon name="file-code" size="sm" />
        </Button>
        <div className="mx-2 h-6 w-px bg-border" />

        {/* List Buttons */}
        <Button
          variant={isBulletList ? 'secondary' : 'ghost'}
          size="icon"
          onClick={toggleBulletList}
          onMouseDown={(e) => e.preventDefault()}
          aria-label="Bullet List"
          title="Bullet List"
        >
          <Icon name="list" size="sm" />
        </Button>
        <Button
          variant={isNumberedList ? 'secondary' : 'ghost'}
          size="icon"
          onClick={toggleNumberedList}
          onMouseDown={(e) => e.preventDefault()}
          aria-label="Numbered List"
          title="Numbered List"
        >
          <Icon name="list-ordered" size="sm" />
        </Button>
        <div className="mx-2 h-6 w-px bg-border" />
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
