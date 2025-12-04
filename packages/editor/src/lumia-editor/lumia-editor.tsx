import {
  Button,
  EditorToolbar,
  EditorToolbarGroup,
  Select,
  FontCombobox,
  type FontItem,
} from '@lumia/components';
import { Icon } from '@lumia/icons';
import React, { useEffect, useState, useMemo } from 'react';
import {
  DocNode,
  Heading,
  Mark,
  NodeType,
  ParentNode,
  Paragraph,
  ListItem,
} from '../schema/docSchema';
import { LumiaInlineEditor } from '../lumia-inline-editor/lumia-inline-editor';
import {
  FontConfig,
  DEFAULT_FONT_CONFIG,
  getAvailableFonts,
  normalizeFontId,
} from '../config/fontConfig';

export interface LumiaEditorProps {
  value: DocNode;
  onChange: (value: DocNode) => void;
  readOnly?: boolean;
  variant?: 'full' | 'compact';
  mode?: 'document' | 'inline';
  fonts?: FontConfig;
  className?: string;
}

export const LumiaEditor = ({
  value,
  onChange,
  readOnly = false,
  variant = 'full',
  mode = 'document',
  fonts = DEFAULT_FONT_CONFIG,
  className,
}: LumiaEditorProps) => {
  // If inline mode is requested, use LumiaInlineEditor
  if (mode === 'inline') {
    return (
      <LumiaInlineEditor
        value={value}
        onChange={onChange}
        className={className}
      />
    );
  }

  // Document mode - full editor implementation
  // Mock internal state for now since we don't have the full engine runtime
  const [internalValue, setInternalValue] = useState<string>(
    JSON.stringify(value, null, 2),
  );

  useEffect(() => {
    setInternalValue(JSON.stringify(value, null, 2));
  }, [value]);

  // Get available fonts based on config
  const availableFonts = useMemo(() => getAvailableFonts(fonts), [fonts]);

  // Convert FontMeta to FontItem for FontCombobox
  const fontItems: FontItem[] = useMemo(
    () =>
      availableFonts.map((font) => ({
        id: font.id,
        label: font.label,
        category: font.category,
      })),
    [availableFonts],
  );

  // Derive active state from the first block/text node for demonstration
  const firstBlock =
    (value as ParentNode).content && (value as ParentNode).content!.length > 0
      ? (value as ParentNode).content![0]
      : null;
  const activeBlockType = firstBlock?.type || 'paragraph';

  // Get current font from all blocks - detect mixed state
  const getCurrentFont = (): string | null => {
    const content = (value as ParentNode).content;
    if (!content || content.length === 0) {
      return fonts.defaultFontId;
    }

    // Collect all unique font IDs from all blocks
    const fontIds = new Set<string>();

    for (const block of content) {
      if ('attrs' in block && block.attrs && 'fontId' in block.attrs) {
        const fontId = (block.attrs as { fontId?: string }).fontId;
        if (fontId) {
          fontIds.add(fontId);
        }
      }
    }

    // If no fonts found, use default
    if (fontIds.size === 0) {
      return fonts.defaultFontId;
    }

    // If all blocks have the same font, return it
    if (fontIds.size === 1) {
      return normalizeFontId(Array.from(fontIds)[0], fonts);
    }

    // Multiple different fonts - return null for "Mixed" state
    return null;
  };

  const activeFontId = getCurrentFont();

  const firstTextNode =
    firstBlock && 'content' in firstBlock && (firstBlock as ParentNode).content
      ? (firstBlock as ParentNode).content![0]
      : null;
  const activeMarks =
    firstTextNode && 'marks' in firstTextNode
      ? firstTextNode.marks?.map((m: Mark) => m.type) || []
      : [];

  const handleBlockTypeChange = (type: string) => {
    // Mock: Update the first block's type
    const newValue = { ...value };
    if (
      (newValue as ParentNode).content &&
      (newValue as ParentNode).content!.length > 0
    ) {
      const firstBlock = (newValue as ParentNode).content![0];
      const isHeading = type.startsWith('heading');
      const existingFontId =
        firstBlock.attrs && 'fontId' in firstBlock.attrs
          ? (firstBlock.attrs as { fontId?: string }).fontId
          : undefined;

      (newValue as ParentNode).content![0] = {
        ...firstBlock,
        type: (isHeading ? 'heading' : type) as NodeType,
        // Reset attrs if switching to/from heading
        attrs: isHeading
          ? {
              level: parseInt(type.replace('heading', ''), 10) || 1,
              fontId: existingFontId,
            }
          : firstBlock.attrs
            ? { ...firstBlock.attrs, fontId: existingFontId }
            : existingFontId
              ? { fontId: existingFontId }
              : undefined,
      } as DocNode;
      onChange(newValue);
    }
  };

  const handleFontChange = (fontId: string | null) => {
    // Validate and apply font to the first block
    if (!fontId) return;

    const validatedFontId = normalizeFontId(fontId, fonts);
    const newValue = { ...value };

    if (
      (newValue as ParentNode).content &&
      (newValue as ParentNode).content!.length > 0
    ) {
      const firstBlock = (newValue as ParentNode).content![0];
      const blockType = firstBlock.type;

      // Update attrs.fontId based on block type
      if (blockType === 'paragraph') {
        (newValue as ParentNode).content![0] = {
          ...firstBlock,
          attrs: {
            ...(firstBlock.attrs as Paragraph['attrs']),
            fontId: validatedFontId,
          },
        } as Paragraph;
      } else if (blockType === 'heading') {
        (newValue as ParentNode).content![0] = {
          ...firstBlock,
          attrs: {
            ...(firstBlock.attrs as Heading['attrs']),
            fontId: validatedFontId,
          },
        } as Heading;
      } else if (blockType === 'list_item') {
        (newValue as ParentNode).content![0] = {
          ...firstBlock,
          attrs: {
            ...(firstBlock.attrs as ListItem['attrs']),
            fontId: validatedFontId,
          },
        } as ListItem;
      }

      onChange(newValue);
    }
  };

  const handleToggleMark = (markType: string) => {
    // Mock: Toggle mark on the first text node of the first block
    const newValue = { ...value };
    if (
      (newValue as ParentNode).content &&
      (newValue as ParentNode).content!.length > 0
    ) {
      const block = (newValue as ParentNode).content![0];
      if (
        'content' in block &&
        (block as ParentNode).content &&
        (block as ParentNode).content!.length > 0
      ) {
        const textNode = (block as ParentNode).content![0];
        // Allow marks to be undefined initially
        const currentMarks = textNode.marks || [];
        const hasMark = currentMarks.some((m: Mark) => m.type === markType);

        let newMarks;
        if (hasMark) {
          newMarks = currentMarks.filter((m: Mark) => m.type !== markType);
        } else {
          newMarks = [...currentMarks, { type: markType as Mark['type'] }];
        }

        (block as ParentNode).content![0] = {
          ...textNode,
          marks: newMarks,
        };
        onChange(newValue);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);

    try {
      // Try to parse back to JSON to simulate engine update
      const parsed = JSON.parse(newValue);
      onChange(parsed);
    } catch (error) {
      // Ignore parse errors for this mock implementation
      console.warn('Failed to parse editor content', error);
    }
  };

  return (
    <div className={`lumia-editor ${className || ''} ${variant}`}>
      {/* Placeholder for Toolbar */}
      {/* Toolbar */}
      {!readOnly && (
        <EditorToolbar className="border-b" variant={variant}>
          <EditorToolbarGroup>
            <Select
              className="w-32"
              value={
                activeBlockType === 'heading'
                  ? `heading${(firstBlock as Heading)?.attrs?.level || 1}`
                  : activeBlockType
              }
              onChange={(e) => handleBlockTypeChange(e.target.value)}
              aria-label="Block type"
            >
              <option value="paragraph">Paragraph</option>
              <option value="heading1">Heading 1</option>
              <option value="heading2">Heading 2</option>
              <option value="heading3">Heading 3</option>
            </Select>
          </EditorToolbarGroup>

          {variant === 'full' && (
            <EditorToolbarGroup>
              <FontCombobox
                fonts={fontItems}
                value={activeFontId}
                onChange={handleFontChange}
                placeholder="Select font..."
                className="w-36"
              />
            </EditorToolbarGroup>
          )}

          <EditorToolbarGroup>
            <Button
              variant={activeMarks.includes('bold') ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => handleToggleMark('bold')}
              title="Bold"
              aria-label="Bold"
              aria-pressed={activeMarks.includes('bold')}
            >
              <Icon id="bold" className="h-4 w-4" />
            </Button>
            <Button
              variant={activeMarks.includes('italic') ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => handleToggleMark('italic')}
              title="Italic"
              aria-label="Italic"
              aria-pressed={activeMarks.includes('italic')}
            >
              <Icon id="italic" className="h-4 w-4" />
            </Button>

            {/* Link button - shown in both variants */}
            <Button
              variant={activeMarks.includes('link') ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => console.log('Link')}
              title="Link"
              aria-label="Insert link"
              aria-pressed={activeMarks.includes('link')}
            >
              <Icon id="link" className="h-4 w-4" />
            </Button>

            {variant === 'full' && (
              <>
                <Button
                  variant={
                    activeMarks.includes('underline') ? 'secondary' : 'ghost'
                  }
                  size="icon"
                  onClick={() => handleToggleMark('underline')}
                  title="Underline"
                  aria-label="Underline"
                  aria-pressed={activeMarks.includes('underline')}
                >
                  <Icon id="underline" className="h-4 w-4" />
                </Button>
                <Button
                  variant={activeMarks.includes('code') ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => handleToggleMark('code')}
                  title="Code"
                  aria-label="Code"
                  aria-pressed={activeMarks.includes('code')}
                >
                  <Icon id="code" className="h-4 w-4" />
                </Button>
              </>
            )}
          </EditorToolbarGroup>

          {variant === 'full' && (
            <>
              <EditorToolbarGroup>
                <Button
                  variant={
                    activeBlockType === 'bullet_list' ? 'secondary' : 'ghost'
                  }
                  size="icon"
                  onClick={() => handleBlockTypeChange('bullet_list')}
                  title="Bullet List"
                  aria-label="Bullet list"
                >
                  <Icon id="list" className="h-4 w-4" />
                </Button>
                <Button
                  variant={
                    activeBlockType === 'ordered_list' ? 'secondary' : 'ghost'
                  }
                  size="icon"
                  onClick={() => handleBlockTypeChange('ordered_list')}
                  title="Ordered List"
                  aria-label="Numbered list"
                >
                  <Icon id="list-ordered" className="h-4 w-4" />
                </Button>
              </EditorToolbarGroup>

              <EditorToolbarGroup>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => console.log('Align Left')}
                  title="Align Left"
                  aria-label="Align left"
                >
                  <Icon id="align-left" className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => console.log('Align Center')}
                  title="Align Center"
                  aria-label="Align center"
                >
                  <Icon id="align-center" className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => console.log('Align Right')}
                  title="Align Right"
                  aria-label="Align right"
                >
                  <Icon id="align-right" className="h-4 w-4" />
                </Button>
              </EditorToolbarGroup>
            </>
          )}
        </EditorToolbar>
      )}

      <div className="lumia-editor-content p-4">
        {readOnly ? (
          <pre
            className="whitespace-pre-wrap"
            data-testid="lumia-editor-readonly-view"
          >
            {internalValue}
          </pre>
        ) : (
          <textarea
            className="w-full h-64 p-2 border rounded"
            value={internalValue}
            onChange={handleChange}
            readOnly={readOnly}
            data-testid="lumia-editor-input"
            aria-label="Editor content"
          />
        )}
      </div>
    </div>
  );
};
