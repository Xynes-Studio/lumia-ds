import type { Meta, StoryObj } from '@storybook/react';
import { LumiaEditor } from '../../lumia-editor';
import type { LumiaEditorStateJSON } from '../../types';

const meta: Meta<typeof LumiaEditor> = {
  title: 'Table/Basic',
  component: LumiaEditor,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LumiaEditor>;

/**
 * Creates a pre-seeded table JSON structure.
 * This generates a 3x3 table with text cells.
 */
const createTableJSON = (): LumiaEditorStateJSON => {
  const createTextNode = (text: string) => ({
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    text,
    type: 'text',
    version: 1,
  });

  const createParagraph = (text: string) => ({
    children: [createTextNode(text)],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'paragraph',
    version: 1,
  });

  const createTableCell = (text: string, headerState = 0) => ({
    children: [createParagraph(text)],
    colSpan: 1,
    rowSpan: 1,
    headerState,
    width: undefined,
    type: 'tablecell',
    version: 1,
    direction: 'ltr',
    format: '',
    indent: 0,
  });

  const createTableRow = (cells: ReturnType<typeof createTableCell>[]) => ({
    children: cells,
    type: 'tablerow',
    version: 1,
    direction: 'ltr',
    format: '',
    indent: 0,
  });

  return {
    root: {
      children: [
        {
          children: [createTextNode('Table Example')],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'heading',
          version: 1,
          tag: 'h1',
        },
        {
          children: [
            createTextNode(
              'Below is a pre-seeded table demonstrating the @lexical/table integration.',
            ),
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
        {
          children: [
            // Header row (headerState = 1 for header cells)
            createTableRow([
              createTableCell('Header 1', 1),
              createTableCell('Header 2', 1),
              createTableCell('Header 3', 1),
            ]),
            // Data rows
            createTableRow([
              createTableCell('Row 1, Cell 1'),
              createTableCell('Row 1, Cell 2'),
              createTableCell('Row 1, Cell 3'),
            ]),
            createTableRow([
              createTableCell('Row 2, Cell 1'),
              createTableCell('Row 2, Cell 2'),
              createTableCell('Row 2, Cell 3'),
            ]),
            createTableRow([
              createTableCell('Row 3, Cell 1'),
              createTableCell('Row 3, Cell 2'),
              createTableCell('Row 3, Cell 3'),
            ]),
          ],
          type: 'table',
          version: 1,
          direction: 'ltr',
          format: '',
          indent: 0,
        },
        {
          children: [
            createTextNode('You can click on cells to edit them directly.'),
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  };
};

/**
 * A basic table story with pre-seeded content.
 * Shows a 3x3 table with header row and data cells.
 */
export const Basic: Story = {
  args: {
    value: createTableJSON(),
    onChange: (val) => console.log('Table onChange:', val),
    mode: 'document',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates a pre-seeded table with 3 columns and 4 rows (including header). Click on cells to edit text content.',
      },
    },
  },
};

/**
 * Demonstrates the table action menu for adding/removing rows and columns.
 * Click inside a table cell to see the floating toolbar.
 */
export const WithControls: Story = {
  args: {
    value: createTableJSON(),
    onChange: (val) => console.log('Table onChange:', val),
    mode: 'document',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Click inside any table cell to see the table action menu. Use it to insert rows above/below, columns left/right, or delete rows/columns. The menu appears as a floating toolbar above the table.',
      },
    },
  },
};

/**
 * An empty table for testing table creation.
 */
export const EmptyTable: Story = {
  args: {
    value: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Empty Table Example',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'heading',
            version: 1,
            tag: 'h2',
          },
          {
            children: [
              {
                children: [
                  {
                    children: [],
                    colSpan: 1,
                    rowSpan: 1,
                    headerState: 0,
                    width: undefined,
                    type: 'tablecell',
                    version: 1,
                    direction: 'ltr',
                    format: '',
                    indent: 0,
                  },
                  {
                    children: [],
                    colSpan: 1,
                    rowSpan: 1,
                    headerState: 0,
                    width: undefined,
                    type: 'tablecell',
                    version: 1,
                    direction: 'ltr',
                    format: '',
                    indent: 0,
                  },
                ],
                type: 'tablerow',
                version: 1,
                direction: 'ltr',
                format: '',
                indent: 0,
              },
              {
                children: [
                  {
                    children: [],
                    colSpan: 1,
                    rowSpan: 1,
                    headerState: 0,
                    width: undefined,
                    type: 'tablecell',
                    version: 1,
                    direction: 'ltr',
                    format: '',
                    indent: 0,
                  },
                  {
                    children: [],
                    colSpan: 1,
                    rowSpan: 1,
                    headerState: 0,
                    width: undefined,
                    type: 'tablecell',
                    version: 1,
                    direction: 'ltr',
                    format: '',
                    indent: 0,
                  },
                ],
                type: 'tablerow',
                version: 1,
                direction: 'ltr',
                format: '',
                indent: 0,
              },
            ],
            type: 'table',
            version: 1,
            direction: 'ltr',
            format: '',
            indent: 0,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    },
    onChange: (val) => console.log('Empty Table onChange:', val),
    mode: 'document',
  },
  parameters: {
    docs: {
      description: {
        story:
          'An empty 2x2 table for testing table creation and cell editing.',
      },
    },
  },
};

/**
 * Demonstrates table insertion via toolbar button or /table slash command.
 * Click the Table button in the toolbar or type /table to insert a 3×3 table.
 */
export const Insert: Story = {
  args: {
    value: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Table Insert Demo',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'heading',
            version: 1,
            tag: 'h2',
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Click the Table button in the toolbar above to insert a 3×3 table.',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'You can also type /table at the start of a line or after a space to insert a table.',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          },
          {
            children: [],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    },
    onChange: (val) => console.log('Insert Table onChange:', val),
    mode: 'document',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates table insertion. Use the Table button in the toolbar or type /table to insert a 3×3 table. Tables support Tab/Shift+Tab navigation between cells.',
      },
    },
  },
};
