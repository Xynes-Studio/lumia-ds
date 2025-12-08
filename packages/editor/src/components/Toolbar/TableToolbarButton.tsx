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
    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
      rows: '3',
      columns: '3',
      includeHeaders: true,
    });
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
