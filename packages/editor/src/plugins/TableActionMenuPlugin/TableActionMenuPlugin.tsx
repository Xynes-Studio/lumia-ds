/**
 * TableActionMenuPlugin - Displays contextual toolbar for table row/column operations.
 *
 * When the user's selection is inside a table, this plugin renders a floating
 * toolbar above the table with buttons to insert/delete rows and columns.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, LexicalNode } from 'lexical';
import { $isTableNode, TableNode } from '@lexical/table';
import { Button, Checkbox } from '@lumia/components';
import {
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import {
  $insertRow,
  $insertColumn,
  $deleteRow,
  $deleteColumn,
  $getTableDimensions,
  $hasTableHeaderRow,
  $toggleTableHeaderRow,
} from './tableUtils';

/**
 * Gets the table node from a lexical node by traversing up the parent chain.
 */
function $getTableNodeFromLexicalNode(node: LexicalNode): TableNode | null {
  let current: LexicalNode | null = node;
  while (current !== null) {
    if ($isTableNode(current)) {
      return current;
    }
    current = current.getParent();
  }
  return null;
}

interface TableActionMenuProps {
  anchorElem?: HTMLElement;
}

export function TableActionMenuPlugin({
  anchorElem,
}: TableActionMenuProps): React.ReactNode {
  const [editor] = useLexicalComposerContext();
  const [isInTable, setIsInTable] = useState(false);
  const [tableElement, setTableElement] = useState<HTMLElement | null>(null);
  const [canDeleteRow, setCanDeleteRow] = useState(true);
  const [canDeleteColumn, setCanDeleteColumn] = useState(true);
  const [hasHeaderRow, setHasHeaderRow] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Update state based on selection
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          setIsInTable(false);
          setTableElement(null);
          return;
        }

        const anchor = selection.anchor.getNode();
        const tableNode = $getTableNodeFromLexicalNode(anchor);

        if (tableNode) {
          setIsInTable(true);

          // Get the DOM element for the table
          const tableElem = editor.getElementByKey(tableNode.getKey());
          setTableElement(tableElem);

          // Check if we can delete rows/columns
          const dimensions = $getTableDimensions();
          if (dimensions) {
            setCanDeleteRow(dimensions.rowCount > 1);
            setCanDeleteColumn(dimensions.columnCount > 1);
          }

          // Check if first row is a header row
          const isHeaderRow = $hasTableHeaderRow();
          setHasHeaderRow(isHeaderRow);
        } else {
          setIsInTable(false);
          setTableElement(null);
        }
      });
    });
  }, [editor]);

  // Handle insert row above
  const handleInsertRowAbove = useCallback(() => {
    editor.update(() => {
      $insertRow(false); // insertAfter=false means insert before (above)
    });
  }, [editor]);

  // Handle insert row below
  const handleInsertRowBelow = useCallback(() => {
    editor.update(() => {
      $insertRow(true); // insertAfter=true means insert after (below)
    });
  }, [editor]);

  // Handle insert column left
  const handleInsertColumnLeft = useCallback(() => {
    editor.update(() => {
      $insertColumn(false); // insertAfter=false means insert before (left)
    });
  }, [editor]);

  // Handle insert column right
  const handleInsertColumnRight = useCallback(() => {
    editor.update(() => {
      $insertColumn(true); // insertAfter=true means insert after (right)
    });
  }, [editor]);

  // Handle delete row
  const handleDeleteRow = useCallback(() => {
    editor.update(() => {
      $deleteRow();
    });
  }, [editor]);

  // Handle delete column
  const handleDeleteColumn = useCallback(() => {
    editor.update(() => {
      $deleteColumn();
    });
  }, [editor]);

  // Handle toggle header row
  const handleToggleHeaderRow = useCallback(() => {
    editor.update(() => {
      $toggleTableHeaderRow(!hasHeaderRow);
    });
  }, [editor, hasHeaderRow]);

  if (!isInTable || !tableElement) {
    return null;
  }

  // Calculate position for the menu
  const tableRect = tableElement.getBoundingClientRect();
  const containerRect = (anchorElem || document.body).getBoundingClientRect();

  const top = tableRect.top - containerRect.top - 40; // 40px above the table
  const left = tableRect.left - containerRect.left;

  const menu = (
    <div
      ref={menuRef}
      className="table-action-menu"
      style={{
        position: 'absolute',
        top: `${Math.max(0, top)}px`,
        left: `${left}px`,
      }}
    >
      {/* Header Row Toggle */}
      <div className="table-action-group table-action-header-group">
        <Checkbox
          id="table-header-row"
          checked={hasHeaderRow}
          onChange={handleToggleHeaderRow}
          label="Header row"
          className="table-header-checkbox"
        />
      </div>

      <div className="table-action-divider" />

      {/* Row Operations */}
      <div className="table-action-group">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleInsertRowAbove}
          onMouseDown={(e) => e.preventDefault()}
          aria-label="Insert row above"
          title="Insert row above"
          className="table-action-button"
        >
          <ArrowUp className="h-3 w-3" />
          <Plus className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleInsertRowBelow}
          onMouseDown={(e) => e.preventDefault()}
          aria-label="Insert row below"
          title="Insert row below"
          className="table-action-button"
        >
          <ArrowDown className="h-3 w-3" />
          <Plus className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDeleteRow}
          onMouseDown={(e) => e.preventDefault()}
          disabled={!canDeleteRow}
          aria-label="Delete row"
          title="Delete row"
          className="table-action-button table-action-delete"
        >
          <Minus className="h-3 w-3" />
          <span className="text-xs">Row</span>
        </Button>
      </div>

      <div className="table-action-divider" />

      {/* Column Operations */}
      <div className="table-action-group">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleInsertColumnLeft}
          onMouseDown={(e) => e.preventDefault()}
          aria-label="Insert column left"
          title="Insert column left"
          className="table-action-button"
        >
          <ArrowLeft className="h-3 w-3" />
          <Plus className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleInsertColumnRight}
          onMouseDown={(e) => e.preventDefault()}
          aria-label="Insert column right"
          title="Insert column right"
          className="table-action-button"
        >
          <ArrowRight className="h-3 w-3" />
          <Plus className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDeleteColumn}
          onMouseDown={(e) => e.preventDefault()}
          disabled={!canDeleteColumn}
          aria-label="Delete column"
          title="Delete column"
          className="table-action-button table-action-delete"
        >
          <Minus className="h-3 w-3" />
          <span className="text-xs">Col</span>
        </Button>
      </div>
    </div>
  );

  // Render to portal if anchorElem provided, otherwise render in place
  if (anchorElem) {
    return createPortal(menu, anchorElem);
  }

  return menu;
}
