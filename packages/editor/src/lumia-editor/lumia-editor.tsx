import {
  Button,
  EditorToolbar,
  EditorToolbarGroup,
  Select,
} from '@lumia/components';
import { Icon } from '@lumia/icons';
import React, { useEffect, useState } from 'react';
import {
  DocNode,
  Heading,
  Mark,
  NodeType,
  ParentNode,
} from '../schema/docSchema';

export interface LumiaEditorProps {
  value: DocNode;
  onChange: (value: DocNode) => void;
  readOnly?: boolean;
  variant?: 'full' | 'compact';
  className?: string;
}

export const LumiaEditor = ({
  value,
  onChange,
  readOnly = false,
  variant = 'full',
  className,
}: LumiaEditorProps) => {
  // Mock internal state for now since we don't have the full engine runtime
  const [internalValue, setInternalValue] = useState<string>(
    JSON.stringify(value, null, 2),
  );

  useEffect(() => {
    setInternalValue(JSON.stringify(value, null, 2));
  }, [value]);

  // Derive active state from the first block/text node for demonstration
  const firstBlock =
    (value as ParentNode).content && (value as ParentNode).content!.length > 0
      ? (value as ParentNode).content![0]
      : null;
  const activeBlockType = firstBlock?.type || 'paragraph';
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
      (newValue as ParentNode).content![0] = {
        ...firstBlock,
        type: (isHeading ? 'heading' : type) as NodeType,
        // Reset attrs if switching to/from heading
        attrs: isHeading
          ? { level: parseInt(type.replace('heading', ''), 10) || 1 }
          : undefined,
      } as DocNode;
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
      {!readOnly && variant === 'full' && (
        <EditorToolbar className="border-b">
          <EditorToolbarGroup>
            <Select
              className="w-32"
              value={
                activeBlockType === 'heading'
                  ? `heading${(firstBlock as Heading)?.attrs?.level || 1}`
                  : activeBlockType
              }
              onChange={(e) => handleBlockTypeChange(e.target.value)}
            >
              <option value="paragraph">Paragraph</option>
              <option value="heading1">Heading 1</option>
              <option value="heading2">Heading 2</option>
              <option value="heading3">Heading 3</option>
            </Select>
          </EditorToolbarGroup>

          <EditorToolbarGroup>
            <Button
              variant={activeMarks.includes('bold') ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => handleToggleMark('bold')}
              title="Bold"
            >
              <Icon id="bold" className="h-4 w-4" />
            </Button>
            <Button
              variant={activeMarks.includes('italic') ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => handleToggleMark('italic')}
              title="Italic"
            >
              <Icon id="italic" className="h-4 w-4" />
            </Button>
            <Button
              variant={
                activeMarks.includes('underline') ? 'secondary' : 'ghost'
              }
              size="icon"
              onClick={() => handleToggleMark('underline')}
              title="Underline"
            >
              <Icon id="underline" className="h-4 w-4" />
            </Button>
            <Button
              variant={activeMarks.includes('code') ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => handleToggleMark('code')}
              title="Code"
            >
              <Icon id="code" className="h-4 w-4" />
            </Button>
          </EditorToolbarGroup>

          <EditorToolbarGroup>
            <Button
              variant={
                activeBlockType === 'bullet_list' ? 'secondary' : 'ghost'
              }
              size="icon"
              onClick={() => handleBlockTypeChange('bullet_list')}
              title="Bullet List"
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
            >
              <Icon id="align-left" className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => console.log('Align Center')}
              title="Align Center"
            >
              <Icon id="align-center" className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => console.log('Align Right')}
              title="Align Right"
            >
              <Icon id="align-right" className="h-4 w-4" />
            </Button>
          </EditorToolbarGroup>
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
          />
        )}
      </div>
    </div>
  );
};
