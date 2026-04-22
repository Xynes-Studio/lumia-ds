import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { TableActionMenuPlugin } from './TableActionMenuPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection } from 'lexical';
import {
  $deleteColumn,
  $deleteRow,
  $deleteTable,
  $getTableDimensions,
  $hasTableHeaderRow,
  $insertColumn,
  $insertRow,
  $toggleTableHeaderRow,
} from './tableUtils';

vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: vi.fn(),
}));

vi.mock('lexical', () => ({
  $getSelection: vi.fn(),
  $isRangeSelection: vi.fn(),
}));

vi.mock('@lexical/table', () => ({
  $isTableNode: (node: { __type?: string } | null) => node?.__type === 'table',
  TableNode: class {},
}));

vi.mock('@lumia-ui/components', () => ({
  Button: ({ children, onClick, ...props }: ComponentProps<'button'>) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  Checkbox: ({
    label,
    onChange,
    checked,
    id,
    ...props
  }: ComponentProps<'input'> & { label: string }) => (
    <label htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        {...props}
      />
      {label}
    </label>
  ),
}));

vi.mock('lucide-react', () => ({
  Plus: () => <span>Plus</span>,
  Minus: () => <span>Minus</span>,
  ArrowUp: () => <span>ArrowUp</span>,
  ArrowDown: () => <span>ArrowDown</span>,
  ArrowLeft: () => <span>ArrowLeft</span>,
  ArrowRight: () => <span>ArrowRight</span>,
  Trash2: () => <span>Trash2</span>,
}));

vi.mock('./tableUtils', () => ({
  $insertRow: vi.fn(),
  $insertColumn: vi.fn(),
  $deleteRow: vi.fn(),
  $deleteColumn: vi.fn(),
  $deleteTable: vi.fn(),
  $getTableDimensions: vi.fn(),
  $hasTableHeaderRow: vi.fn(),
  $toggleTableHeaderRow: vi.fn(),
}));

describe('TableActionMenuPlugin integration', () => {
  let updateListener:
    | ((payload: {
        editorState: { read: (callback: () => void) => void };
      }) => void)
    | null;

  const tableElement = {
    getBoundingClientRect: () => ({
      top: 220,
      bottom: 320,
      left: 140,
    }),
  } as HTMLElement;

  const mockEditor = {
    registerUpdateListener: vi.fn((listener) => {
      updateListener = listener;
      return vi.fn();
    }),
    update: vi.fn((callback: () => void) => callback()),
    getElementByKey: vi.fn(() => tableElement),
  };

  const emitSelection = (options?: {
    isRange?: boolean;
    inTable?: boolean;
    rowCount?: number;
    columnCount?: number;
    hasHeaderRow?: boolean;
  }) => {
    const {
      isRange = true,
      inTable = true,
      rowCount = 2,
      columnCount = 2,
      hasHeaderRow = false,
    } = options ?? {};

    const tableNode = {
      __type: 'table',
      getParent: () => null,
      getKey: () => 'table-key',
    };
    const anchorNode = inTable
      ? {
          __type: 'paragraph',
          getParent: () => tableNode,
        }
      : {
          __type: 'paragraph',
          getParent: () => null,
        };

    ($getSelection as Mock).mockReturnValue({
      anchor: {
        getNode: () => anchorNode,
      },
    });
    ($isRangeSelection as Mock).mockReturnValue(isRange);
    ($getTableDimensions as Mock).mockReturnValue({ rowCount, columnCount });
    ($hasTableHeaderRow as Mock).mockReturnValue(hasHeaderRow);

    act(() => {
      updateListener?.({
        editorState: {
          read: (callback) => callback(),
        },
      });
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    updateListener = null;
    (useLexicalComposerContext as Mock).mockReturnValue([mockEditor]);
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 900,
    });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1440,
    });
  });

  it('stays hidden when the current selection is not inside a table', () => {
    render(<TableActionMenuPlugin />);

    emitSelection({ isRange: false });
    expect(screen.queryByLabelText('Insert row above')).not.toBeInTheDocument();

    emitSelection({ inTable: false });
    expect(screen.queryByLabelText('Insert row above')).not.toBeInTheDocument();
  });

  it('renders the contextual controls and disables destructive actions for single-row tables', () => {
    render(<TableActionMenuPlugin />);

    emitSelection({ rowCount: 1, columnCount: 1, hasHeaderRow: true });

    expect(screen.getByLabelText('Insert row above')).toBeInTheDocument();
    expect(screen.getByLabelText('Insert row below')).toBeInTheDocument();
    expect(screen.getByLabelText('Insert column left')).toBeInTheDocument();
    expect(screen.getByLabelText('Insert column right')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete row')).toBeDisabled();
    expect(screen.getByLabelText('Delete column')).toBeDisabled();
    expect(screen.getByLabelText('Header row')).toBeChecked();
  });

  it('dispatches all table actions through editor updates', () => {
    render(<TableActionMenuPlugin />);

    emitSelection({ rowCount: 3, columnCount: 4, hasHeaderRow: false });

    fireEvent.click(screen.getByLabelText('Insert row above'));
    fireEvent.click(screen.getByLabelText('Insert row below'));
    fireEvent.click(screen.getByLabelText('Insert column left'));
    fireEvent.click(screen.getByLabelText('Insert column right'));
    fireEvent.click(screen.getByLabelText('Delete row'));
    fireEvent.click(screen.getByLabelText('Delete column'));
    fireEvent.click(screen.getByLabelText('Delete table'));
    fireEvent.click(screen.getByLabelText('Header row'));

    expect(mockEditor.update).toHaveBeenCalledTimes(8);
    expect($insertRow).toHaveBeenNthCalledWith(1, false);
    expect($insertRow).toHaveBeenNthCalledWith(2, true);
    expect($insertColumn).toHaveBeenNthCalledWith(1, false);
    expect($insertColumn).toHaveBeenNthCalledWith(2, true);
    expect($deleteRow).toHaveBeenCalledTimes(1);
    expect($deleteColumn).toHaveBeenCalledTimes(1);
    expect($deleteTable).toHaveBeenCalledTimes(1);
    expect($toggleTableHeaderRow).toHaveBeenCalledWith(true);
  });
});
