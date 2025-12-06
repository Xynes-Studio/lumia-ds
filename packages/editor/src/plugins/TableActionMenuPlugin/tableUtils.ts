/**
 * Table utility functions for row/column operations.
 * These wrap @lexical/table experimental APIs for use in our editor.
 */
import { $getSelection, $isRangeSelection, LexicalNode } from 'lexical';
import {
  $getTableCellNodeFromLexicalNode,
  $insertTableRow__EXPERIMENTAL,
  $insertTableColumn__EXPERIMENTAL,
  $deleteTableRow__EXPERIMENTAL,
  $deleteTableColumn__EXPERIMENTAL,
  $isTableCellNode,
  $isTableRowNode,
  $isTableNode,
  TableCellNode,
  TableNode,
  TableRowNode,
  TableCellHeaderStates,
} from '@lexical/table';

/**
 * Gets the table node from a lexical node by traversing up the parent chain.
 * @param node - The starting node
 * @returns The TableNode or null if not inside a table
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

/**
 * Gets the current table cell node from selection.
 * @returns The TableCellNode or null if not in a table
 */
export function $getSelectedTableCell(): TableCellNode | null {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) {
    return null;
  }

  const anchor = selection.anchor.getNode();
  const tableCellNode = $getTableCellNodeFromLexicalNode(anchor);

  return tableCellNode;
}

/**
 * Gets the current table node from selection.
 * @returns The TableNode or null if not in a table
 */
export function $getSelectedTable(): TableNode | null {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) {
    return null;
  }

  const anchor = selection.anchor.getNode();
  const tableNode = $getTableNodeFromLexicalNode(anchor);

  return tableNode;
}

/**
 * Gets the current table row node from selection.
 * @returns The TableRowNode or null if not in a table
 */
export function $getSelectedTableRow(): TableRowNode | null {
  const cellNode = $getSelectedTableCell();
  if (!cellNode) {
    return null;
  }

  const parent = cellNode.getParent();
  if ($isTableRowNode(parent)) {
    return parent;
  }

  return null;
}

/**
 * Inserts a new row above or below the current selection.
 * @param insertAfter - If true, inserts below (after current row); if false, inserts above (before current row)
 * @returns true if successful, false otherwise
 */
export function $insertRow(insertAfter: boolean): boolean {
  const cellNode = $getSelectedTableCell();
  if (!cellNode) {
    return false;
  }

  try {
    $insertTableRow__EXPERIMENTAL(insertAfter);
    return true;
  } catch {
    return false;
  }
}

/**
 * Inserts a new column to the left or right of the current selection.
 * @param insertAfter - If true, inserts right (after current cell); if false, inserts left (before current cell)
 * @returns true if successful, false otherwise
 */
export function $insertColumn(insertAfter: boolean): boolean {
  const cellNode = $getSelectedTableCell();
  if (!cellNode) {
    return false;
  }

  try {
    $insertTableColumn__EXPERIMENTAL(insertAfter);
    return true;
  } catch {
    return false;
  }
}

/**
 * Deletes the current row from the table.
 * @returns true if successful, false otherwise
 */
export function $deleteRow(): boolean {
  const cellNode = $getSelectedTableCell();
  if (!cellNode) {
    return false;
  }

  const tableNode = $getSelectedTable();
  if (!tableNode) {
    return false;
  }

  // Don't delete if only one row remains
  const rows = tableNode.getChildren().filter($isTableRowNode);
  if (rows.length <= 1) {
    return false;
  }

  try {
    $deleteTableRow__EXPERIMENTAL();
    return true;
  } catch {
    return false;
  }
}

/**
 * Deletes the current column from the table.
 * @returns true if successful, false otherwise
 */
export function $deleteColumn(): boolean {
  const cellNode = $getSelectedTableCell();
  if (!cellNode) {
    return false;
  }

  const tableNode = $getSelectedTable();
  if (!tableNode) {
    return false;
  }

  // Check column count from first row
  const firstRow = tableNode.getChildren().find($isTableRowNode);
  if (!firstRow) {
    return false;
  }

  const columns = firstRow.getChildren().filter($isTableCellNode);
  if (columns.length <= 1) {
    return false;
  }

  try {
    $deleteTableColumn__EXPERIMENTAL();
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets the current row and column count for a table.
 * @returns Object with rowCount and columnCount, or null if not in a table
 */
export function $getTableDimensions(): {
  rowCount: number;
  columnCount: number;
} | null {
  const tableNode = $getSelectedTable();
  if (!tableNode) {
    return null;
  }

  const rows = tableNode.getChildren().filter($isTableRowNode);
  const rowCount = rows.length;

  // Get column count from first row
  const firstRow = rows[0];
  if (!firstRow) {
    return { rowCount: 0, columnCount: 0 };
  }

  const columnCount = firstRow.getChildren().filter($isTableCellNode).length;

  return { rowCount, columnCount };
}

/**
 * Checks if the current table has a header row (first row has header styling).
 * @returns true if first row cells have row header styling, false otherwise
 */
export function $hasTableHeaderRow(): boolean {
  const tableNode = $getSelectedTable();
  if (!tableNode) return false;

  const rows = tableNode.getChildren().filter($isTableRowNode);
  const firstRow = rows[0];
  if (!firstRow) return false;

  const cells = firstRow.getChildren().filter($isTableCellNode);
  if (cells.length === 0) return false;

  // Check if all cells in first row have row header styling
  return cells.every((cell) => {
    const headerState = cell.getHeaderStyles();
    return (headerState & TableCellHeaderStates.ROW) !== 0;
  });
}

/**
 * Toggles header row styling for the first row of the current table.
 * @param enable - If true, sets first row as header; if false, removes header styling
 * @returns true if successful, false otherwise
 */
export function $toggleTableHeaderRow(enable: boolean): boolean {
  const tableNode = $getSelectedTable();
  if (!tableNode) return false;

  const rows = tableNode.getChildren().filter($isTableRowNode);
  const firstRow = rows[0];
  if (!firstRow) return false;

  const cells = firstRow.getChildren().filter($isTableCellNode);

  for (const cell of cells) {
    const currentState = cell.getHeaderStyles();
    if (enable) {
      // Add ROW header styling (preserve COLUMN if present)
      cell.setHeaderStyles(
        currentState | TableCellHeaderStates.ROW,
        TableCellHeaderStates.ROW,
      );
    } else {
      // Remove ROW header styling (preserve COLUMN if present)
      cell.setHeaderStyles(
        currentState & ~TableCellHeaderStates.ROW,
        TableCellHeaderStates.ROW,
      );
    }
  }

  return true;
}
