import { describe, test, expect, beforeEach } from 'vitest';
import { createHeadlessEditor } from '@lexical/headless';
import {
  TableNode,
  TableRowNode,
  TableCellNode,
  $createTableNode,
  $createTableRowNode,
  $createTableCellNode,
  registerTablePlugin,
  $isTableNode,
  $isTableRowNode,
  $isTableCellNode,
  TableCellHeaderStates,
} from '@lexical/table';
import {
  ParagraphNode,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isParagraphNode,
} from 'lexical';
import {
  $insertRow,
  $insertColumn,
  $deleteRow,
  $deleteColumn,
  $getSelectedTableCell,
  $getSelectedTable,
  $getSelectedTableRow,
  $getTableDimensions,
  $hasTableHeaderRow,
  $toggleTableHeaderRow,
} from './tableUtils';

describe('tableUtils', () => {
  let editor: ReturnType<typeof createHeadlessEditor>;

  beforeEach(() => {
    editor = createHeadlessEditor({
      nodes: [TableNode, TableRowNode, TableCellNode, ParagraphNode],
    });
    registerTablePlugin(editor);
  });

  /**
   * Helper to create a table with specified dimensions
   */
  const createTestTable = async (rows: number, cols: number) => {
    await editor.update(() => {
      const root = $getRoot();
      root.clear();

      const tableNode = $createTableNode();

      for (let r = 0; r < rows; r++) {
        const rowNode = $createTableRowNode();
        for (let c = 0; c < cols; c++) {
          const cellNode = $createTableCellNode(0);
          const para = $createParagraphNode();
          para.append($createTextNode(`R${r + 1}C${c + 1}`));
          cellNode.append(para);
          rowNode.append(cellNode);
        }
        tableNode.append(rowNode);
      }

      root.append(tableNode);
    });
  };

  /**
   * Helper to select the first cell of the table
   */
  const selectFirstCell = async () => {
    await editor.update(() => {
      const root = $getRoot();
      const table = root.getFirstChild();
      if ($isTableNode(table)) {
        const firstRow = table.getFirstChild();
        if ($isTableRowNode(firstRow)) {
          const firstCell = firstRow.getFirstChild();
          if ($isTableCellNode(firstCell)) {
            const para = firstCell.getFirstChild();
            if ($isParagraphNode(para)) {
              para.selectStart();
            }
          }
        }
      }
    });
  };

  describe('$getSelectedTableCell', () => {
    test('should return null when not in a table', async () => {
      await editor.update(() => {
        const root = $getRoot();
        root.clear();
        const para = $createParagraphNode();
        para.append($createTextNode('Hello'));
        root.append(para);
        para.select();
      });

      editor.getEditorState().read(() => {
        const cell = $getSelectedTableCell();
        expect(cell).toBeNull();
      });
    });

    test('should return TableCellNode when inside a table cell', async () => {
      await createTestTable(2, 2);
      await selectFirstCell();

      editor.getEditorState().read(() => {
        const cell = $getSelectedTableCell();
        expect(cell).toBeInstanceOf(TableCellNode);
      });
    });
  });

  describe('$getSelectedTable', () => {
    test('should return TableNode when inside a table', async () => {
      await createTestTable(2, 2);
      await selectFirstCell();

      editor.getEditorState().read(() => {
        const table = $getSelectedTable();
        expect(table).toBeInstanceOf(TableNode);
      });
    });
  });

  describe('$getSelectedTableRow', () => {
    test('should return TableRowNode when inside a table', async () => {
      await createTestTable(2, 2);
      await selectFirstCell();

      editor.getEditorState().read(() => {
        const row = $getSelectedTableRow();
        expect(row).toBeInstanceOf(TableRowNode);
      });
    });
  });

  describe('$getTableDimensions', () => {
    test('should return correct dimensions for a 2x3 table', async () => {
      await createTestTable(2, 3);
      await selectFirstCell();

      editor.getEditorState().read(() => {
        const dimensions = $getTableDimensions();
        expect(dimensions).toEqual({ rowCount: 2, columnCount: 3 });
      });
    });

    test('should return correct dimensions for a 4x2 table', async () => {
      await createTestTable(4, 2);
      await selectFirstCell();

      editor.getEditorState().read(() => {
        const dimensions = $getTableDimensions();
        expect(dimensions).toEqual({ rowCount: 4, columnCount: 2 });
      });
    });

    test('should return null when not in a table', async () => {
      await editor.update(() => {
        const root = $getRoot();
        root.clear();
        const para = $createParagraphNode();
        para.append($createTextNode('Hello'));
        root.append(para);
        para.select();
      });

      editor.getEditorState().read(() => {
        const dimensions = $getTableDimensions();
        expect(dimensions).toBeNull();
      });
    });
  });

  describe('$insertRow', () => {
    test('should return false when not in a table', async () => {
      await editor.update(() => {
        const root = $getRoot();
        root.clear();
        const para = $createParagraphNode();
        para.append($createTextNode('Hello'));
        root.append(para);
        para.select();
      });

      let result = false;
      await editor.update(() => {
        result = $insertRow(true);
      });

      expect(result).toBe(false);
    });

    test('should insert row above when insertBefore is true', async () => {
      await createTestTable(2, 2);
      await selectFirstCell();

      // Get initial row count
      let initialRowCount = 0;
      editor.getEditorState().read(() => {
        const dimensions = $getTableDimensions();
        initialRowCount = dimensions?.rowCount ?? 0;
      });

      await editor.update(() => {
        $insertRow(true);
      });

      editor.getEditorState().read(() => {
        const dimensions = $getTableDimensions();
        expect(dimensions?.rowCount).toBe(initialRowCount + 1);
      });
    });

    test('should insert row below when insertBefore is false', async () => {
      await createTestTable(2, 2);
      await selectFirstCell();

      let initialRowCount = 0;
      editor.getEditorState().read(() => {
        const dimensions = $getTableDimensions();
        initialRowCount = dimensions?.rowCount ?? 0;
      });

      await editor.update(() => {
        $insertRow(false);
      });

      editor.getEditorState().read(() => {
        const dimensions = $getTableDimensions();
        expect(dimensions?.rowCount).toBe(initialRowCount + 1);
      });
    });
  });

  describe('$insertColumn', () => {
    test('should return false when not in a table', async () => {
      await editor.update(() => {
        const root = $getRoot();
        root.clear();
        const para = $createParagraphNode();
        para.append($createTextNode('Hello'));
        root.append(para);
        para.select();
      });

      let result = false;
      await editor.update(() => {
        result = $insertColumn(true);
      });

      expect(result).toBe(false);
    });

    test('should insert column left when insertBefore is true', async () => {
      await createTestTable(2, 2);
      await selectFirstCell();

      let initialColCount = 0;
      editor.getEditorState().read(() => {
        const dimensions = $getTableDimensions();
        initialColCount = dimensions?.columnCount ?? 0;
      });

      await editor.update(() => {
        $insertColumn(true);
      });

      editor.getEditorState().read(() => {
        const dimensions = $getTableDimensions();
        expect(dimensions?.columnCount).toBe(initialColCount + 1);
      });
    });

    test('should insert column right when insertBefore is false', async () => {
      await createTestTable(2, 2);
      await selectFirstCell();

      let initialColCount = 0;
      editor.getEditorState().read(() => {
        const dimensions = $getTableDimensions();
        initialColCount = dimensions?.columnCount ?? 0;
      });

      await editor.update(() => {
        $insertColumn(false);
      });

      editor.getEditorState().read(() => {
        const dimensions = $getTableDimensions();
        expect(dimensions?.columnCount).toBe(initialColCount + 1);
      });
    });
  });

  describe('$deleteRow', () => {
    test('should return false when not in a table', async () => {
      await editor.update(() => {
        const root = $getRoot();
        root.clear();
        const para = $createParagraphNode();
        para.append($createTextNode('Hello'));
        root.append(para);
        para.select();
      });

      let result = false;
      await editor.update(() => {
        result = $deleteRow();
      });

      expect(result).toBe(false);
    });

    test('should not delete row when only one row remains', async () => {
      await createTestTable(1, 2);
      await selectFirstCell();

      let result = false;
      await editor.update(() => {
        result = $deleteRow();
      });

      expect(result).toBe(false);

      editor.getEditorState().read(() => {
        const dimensions = $getTableDimensions();
        expect(dimensions?.rowCount).toBe(1);
      });
    });

    test('should delete row when multiple rows exist', async () => {
      await createTestTable(3, 2);
      await selectFirstCell();

      let result = false;
      await editor.update(() => {
        result = $deleteRow();
      });

      expect(result).toBe(true);

      editor.getEditorState().read(() => {
        const dimensions = $getTableDimensions();
        expect(dimensions?.rowCount).toBe(2);
      });
    });
  });

  describe('$deleteColumn', () => {
    test('should return false when not in a table', async () => {
      await editor.update(() => {
        const root = $getRoot();
        root.clear();
        const para = $createParagraphNode();
        para.append($createTextNode('Hello'));
        root.append(para);
        para.select();
      });

      let result = false;
      await editor.update(() => {
        result = $deleteColumn();
      });

      expect(result).toBe(false);
    });

    test('should not delete column when only one column remains', async () => {
      await createTestTable(2, 1);
      await selectFirstCell();

      let result = false;
      await editor.update(() => {
        result = $deleteColumn();
      });

      expect(result).toBe(false);

      editor.getEditorState().read(() => {
        const dimensions = $getTableDimensions();
        expect(dimensions?.columnCount).toBe(1);
      });
    });

    test('should delete column when multiple columns exist', async () => {
      await createTestTable(2, 3);
      await selectFirstCell();

      let result = false;
      await editor.update(() => {
        result = $deleteColumn();
      });

      expect(result).toBe(true);

      editor.getEditorState().read(() => {
        const dimensions = $getTableDimensions();
        expect(dimensions?.columnCount).toBe(2);
      });
    });
  });

  describe('$hasTableHeaderRow', () => {
    test('should return false for table without header row', async () => {
      await createTestTable(2, 2);
      await selectFirstCell();

      editor.getEditorState().read(() => {
        const hasHeader = $hasTableHeaderRow();
        expect(hasHeader).toBe(false);
      });
    });

    test('should return true for table with header row', async () => {
      // Create table with header row
      await editor.update(() => {
        const root = $getRoot();
        root.clear();

        const tableNode = $createTableNode();

        // Header row (headerState = ROW)
        const headerRow = $createTableRowNode();
        for (let c = 0; c < 2; c++) {
          const cellNode = $createTableCellNode(TableCellHeaderStates.ROW);
          const para = $createParagraphNode();
          para.append($createTextNode(`Header${c + 1}`));
          cellNode.append(para);
          headerRow.append(cellNode);
        }
        tableNode.append(headerRow);

        // Data row
        const dataRow = $createTableRowNode();
        for (let c = 0; c < 2; c++) {
          const cellNode = $createTableCellNode(0);
          const para = $createParagraphNode();
          para.append($createTextNode(`Data${c + 1}`));
          cellNode.append(para);
          dataRow.append(cellNode);
        }
        tableNode.append(dataRow);

        root.append(tableNode);
      });
      await selectFirstCell();

      editor.getEditorState().read(() => {
        const hasHeader = $hasTableHeaderRow();
        expect(hasHeader).toBe(true);
      });
    });

    test('should return false when not in a table', async () => {
      await editor.update(() => {
        const root = $getRoot();
        root.clear();
        const para = $createParagraphNode();
        para.append($createTextNode('Hello'));
        root.append(para);
        para.select();
      });

      editor.getEditorState().read(() => {
        const hasHeader = $hasTableHeaderRow();
        expect(hasHeader).toBe(false);
      });
    });
  });

  describe('$toggleTableHeaderRow', () => {
    test('should enable header row styling', async () => {
      await createTestTable(2, 2);
      await selectFirstCell();

      // Initially should not have header row
      editor.getEditorState().read(() => {
        expect($hasTableHeaderRow()).toBe(false);
      });

      // Enable header row
      await editor.update(() => {
        $toggleTableHeaderRow(true);
      });

      // Now should have header row
      editor.getEditorState().read(() => {
        expect($hasTableHeaderRow()).toBe(true);
      });
    });

    test('should disable header row styling', async () => {
      // Create table with header row
      await editor.update(() => {
        const root = $getRoot();
        root.clear();

        const tableNode = $createTableNode();

        // Header row
        const headerRow = $createTableRowNode();
        for (let c = 0; c < 2; c++) {
          const cellNode = $createTableCellNode(TableCellHeaderStates.ROW);
          const para = $createParagraphNode();
          para.append($createTextNode(`Header${c + 1}`));
          cellNode.append(para);
          headerRow.append(cellNode);
        }
        tableNode.append(headerRow);

        // Data row
        const dataRow = $createTableRowNode();
        for (let c = 0; c < 2; c++) {
          const cellNode = $createTableCellNode(0);
          const para = $createParagraphNode();
          para.append($createTextNode(`Data${c + 1}`));
          cellNode.append(para);
          dataRow.append(cellNode);
        }
        tableNode.append(dataRow);

        root.append(tableNode);
      });
      await selectFirstCell();

      // Initially should have header row
      editor.getEditorState().read(() => {
        expect($hasTableHeaderRow()).toBe(true);
      });

      // Disable header row
      await editor.update(() => {
        $toggleTableHeaderRow(false);
      });

      // Now should not have header row
      editor.getEditorState().read(() => {
        expect($hasTableHeaderRow()).toBe(false);
      });
    });

    test('should preserve cell content when toggling header', async () => {
      await createTestTable(2, 2);
      await selectFirstCell();

      // Get original cell content
      let originalContent: string[] = [];
      editor.getEditorState().read(() => {
        const root = $getRoot();
        const table = root.getFirstChild();
        if ($isTableNode(table)) {
          const firstRow = table.getFirstChild();
          if ($isTableRowNode(firstRow)) {
            firstRow.getChildren().forEach((cell) => {
              if ($isTableCellNode(cell)) {
                const para = cell.getFirstChild();
                if ($isParagraphNode(para)) {
                  const text = para.getTextContent();
                  originalContent.push(text);
                }
              }
            });
          }
        }
      });

      // Toggle header on
      await editor.update(() => {
        $toggleTableHeaderRow(true);
      });

      // Verify content is preserved
      editor.getEditorState().read(() => {
        const root = $getRoot();
        const table = root.getFirstChild();
        if ($isTableNode(table)) {
          const firstRow = table.getFirstChild();
          if ($isTableRowNode(firstRow)) {
            let index = 0;
            firstRow.getChildren().forEach((cell) => {
              if ($isTableCellNode(cell)) {
                const para = cell.getFirstChild();
                if ($isParagraphNode(para)) {
                  expect(para.getTextContent()).toBe(originalContent[index]);
                  index++;
                }
              }
            });
          }
        }
      });
    });

    test('header state should persist in JSON export', async () => {
      await createTestTable(2, 2);
      await selectFirstCell();

      // Enable header row
      await editor.update(() => {
        $toggleTableHeaderRow(true);
      });

      // Verify headerState is set correctly on cells (which will be serialized to JSON)
      editor.getEditorState().read(() => {
        const root = $getRoot();
        const table = root.getFirstChild();
        if ($isTableNode(table)) {
          const firstRow = table.getFirstChild();
          if ($isTableRowNode(firstRow)) {
            const firstCell = firstRow.getFirstChild();
            if ($isTableCellNode(firstCell)) {
              const headerState = firstCell.getHeaderStyles();
              // Check that headerState includes ROW flag
              expect(headerState & TableCellHeaderStates.ROW).toBe(
                TableCellHeaderStates.ROW,
              );

              // Also verify export works
              const cellJson = firstCell.exportJSON();
              expect(cellJson.headerState & TableCellHeaderStates.ROW).toBe(
                TableCellHeaderStates.ROW,
              );
            }
          }
        }
      });
    });

    test('should return false when not in a table', async () => {
      await editor.update(() => {
        const root = $getRoot();
        root.clear();
        const para = $createParagraphNode();
        para.append($createTextNode('Hello'));
        root.append(para);
        para.select();
      });

      let result = false;
      await editor.update(() => {
        result = $toggleTableHeaderRow(true);
      });

      expect(result).toBe(false);
    });
  });
});
