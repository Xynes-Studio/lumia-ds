import React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Button } from '@lumia/components';
import { Table2 } from 'lucide-react';
import { INSERT_TABLE_COMMAND } from '@lexical/table';

/**
 * TableToolbarButton - Toolbar button for inserting a 3×3 table.
 *
 * Uses the `INSERT_TABLE_COMMAND` from @lexical/table to insert a table
 * at the current selection.
 */
export function TableToolbarButton() {
  const [editor] = useLexicalComposerContext();

  const handleInsertTable = () => {
    // Insert table without headers first (includeHeaders: true creates BOTH row AND column headers)
    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
      rows: '3',
      columns: '3',
      includeHeaders: false,
    });
    // After table insertion, toggle only the first row as header
    setTimeout(() => {
      editor.update(() => {
        // Import dynamically to avoid circular dependencies
        const { $toggleTableHeaderRow } = require('../../plugins/TableActionMenuPlugin/tableUtils');
        $toggleTableHeaderRow(true);
      });
    }, 0);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleInsertTable}
      onMouseDown={(e) => e.preventDefault()}
      aria-label="Insert Table"
      title="Insert Table"
    >
      <Table2 className="h-4 w-4" />
    </Button>
  );
}
