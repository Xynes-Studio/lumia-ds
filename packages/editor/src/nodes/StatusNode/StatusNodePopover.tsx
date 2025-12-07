import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { $getNodeByKey, NodeKey } from 'lexical';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Input,
} from '@lumia/components';
import { StatusPill, StatusPillVariant } from '@lumia/components';
import { $isStatusNode, StatusColor } from './StatusNode';

export interface StatusNodePopoverProps {
  nodeKey: NodeKey;
  text: string;
  color: StatusColor;
}

const COLOR_OPTIONS: {
  value: StatusColor;
  label: string;
  variant: StatusPillVariant;
}[] = [
  { value: 'success', label: 'Success', variant: 'success' },
  { value: 'warning', label: 'Warning', variant: 'warning' },
  { value: 'error', label: 'Error', variant: 'error' },
  { value: 'info', label: 'Info', variant: 'info' },
];

/**
 * StatusNodePopover - Provides popover UI for editing status text and color.
 *
 * Features:
 * - Text input with debounced updates (300ms)
 * - Color swatches for quick color selection
 * - Opens when status pill is clicked
 */
export function StatusNodePopover({
  nodeKey,
  text,
  color,
}: StatusNodePopoverProps): React.ReactElement {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  const [isOpen, setIsOpen] = useState(false);
  const [localText, setLocalText] = useState(text);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local text when prop changes (e.g., when node is updated externally)
  useEffect(() => {
    setLocalText(text);
  }, [text]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const updateNodeText = useCallback(
    (newText: string) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isStatusNode(node)) {
          node.setText(newText);
        }
      });
    },
    [editor, nodeKey],
  );

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newText = e.target.value;
      setLocalText(newText);

      // Debounce update to node
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        updateNodeText(newText);
      }, 300);
    },
    [updateNodeText],
  );

  const handleColorChange = useCallback(
    (newColor: StatusColor) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isStatusNode(node)) {
          node.setColor(newColor);
        }
      });
    },
    [editor, nodeKey],
  );

  const handlePillClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsOpen(true);
      if (!isSelected) {
        clearSelection();
        setSelected(true);
      }
    },
    [isSelected, clearSelection, setSelected],
  );

  const colorToVariant: Record<StatusColor, StatusPillVariant> = {
    success: 'success',
    warning: 'warning',
    error: 'error',
    info: 'info',
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <span
          role="button"
          tabIndex={0}
          onClick={handlePillClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handlePillClick(e as unknown as React.MouseEvent);
            }
          }}
          className="inline-block cursor-pointer"
          data-status-node-trigger
        >
          <StatusPill variant={colorToVariant[color]}>{text}</StatusPill>
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start" side="bottom">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={`status-text-${nodeKey}`}
              className="text-sm font-medium text-foreground"
            >
              Label
            </label>
            <Input
              id={`status-text-${nodeKey}`}
              value={localText}
              onChange={handleTextChange}
              placeholder="Status label"
              className="h-8"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Color</span>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleColorChange(option.value)}
                  className={`status-color-swatch ${
                    color === option.value ? 'status-color-swatch-selected' : ''
                  }`}
                  title={option.label}
                  aria-label={`Set status color to ${option.label}`}
                  aria-pressed={color === option.value}
                >
                  <StatusPill
                    variant={option.variant}
                    className="text-xs px-2 py-0.5"
                  >
                    {option.label[0]}
                  </StatusPill>
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
