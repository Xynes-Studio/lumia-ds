import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toolbar } from './Toolbar';
import { useToolbarState } from './useToolbarState';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, beforeEach, it, expect, Mock } from 'vitest';

// Mock dependencies
vi.mock('./useToolbarState', () => ({
  useToolbarState: vi.fn(),
}));

vi.mock('../components/Fonts', () => ({
  FontCombobox: ({ onChange, value }: any) => (
    <button
      data-testid="font-combobox"
      data-value={value}
      onClick={() => onChange('roboto')}
    >
      Font
    </button>
  ),
}));

vi.mock('../components/Dropdown', () => ({
  Dropdown: ({ onChange, value, options, 'aria-label': ariaLabel }: any) => (
    <div
      data-testid="block-type-dropdown"
      data-value={value}
      aria-label={ariaLabel}
    >
      {options.map((option: { value: string; label: string }) => (
        <button
          key={option.value}
          data-testid={`block-type-option-${option.value}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('../components/Toolbar/InsertBlockMenu', () => ({
  InsertBlockMenu: () => <div data-testid="insert-block-menu">Insert Menu</div>,
}));

vi.mock('@lumia-ui/components', () => ({
  Button: ({ onClick, children, variant, disabled, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  ),
  Toolbar: ({ children }: any) => <div data-testid="toolbar">{children}</div>,
  Popover: ({ children, open }: any) => (
    <div data-state={open ? 'open' : 'closed'}>{children}</div>
  ),
  PopoverContent: ({ children }: any) => (
    <div data-testid="popover-content">{children}</div>
  ),
  PopoverTrigger: ({ children }: any) => <div>{children}</div>,
  Input: ({ onChange, value, onKeyDown }: any) => (
    <input
      data-testid="link-input"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
    />
  ),
}));

// Mock Lucide icons
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-react')>();
  return {
    ...actual,
    Bold: () => <span>BoldIcon</span>,
    Italic: () => <span>ItalicIcon</span>,
    Underline: () => <span>UnderlineIcon</span>,
    Code: () => <span>CodeIcon</span>,
    Link: () => <span>LinkIcon</span>,
    Trash2: () => <span>TrashIcon</span>,
    ExternalLink: () => <span>ExternalLinkIcon</span>,
    FileCode: () => <span>FileCodeIcon</span>,
    List: () => <span>ListIcon</span>,
    ListOrdered: () => <span>ListOrderedIcon</span>,
  };
});

describe('Toolbar', () => {
  const mockEditor = {
    dispatchCommand: vi.fn(),
  };

  const defaultState = {
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isCode: false,
    isCodeBlock: false,
    isLink: false,
    linkUrl: '',
    setLinkUrl: vi.fn(),
    isPopoverOpen: false,
    setIsPopoverOpen: vi.fn(),
    isEditable: true,
    selectedFont: 'inter',
    blockType: 'paragraph',
    isBulletList: false,
    isNumberedList: false,
    fontsConfig: {},
    insertLink: vi.fn(),
    onLinkSubmit: vi.fn(),
    handleFontChange: vi.fn(),
    handleBlockTypeChange: vi.fn(),
    toggleBulletList: vi.fn(),
    toggleNumberedList: vi.fn(),
    editor: mockEditor,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useToolbarState as Mock).mockReturnValue(defaultState);
  });

  it('renders toolbar buttons', () => {
    render(<Toolbar />);

    expect(screen.getByLabelText('Format Bold')).toBeInTheDocument();
    expect(screen.getByLabelText('Format Italics')).toBeInTheDocument();
    expect(screen.getByLabelText('Format Underline')).toBeInTheDocument();
    expect(screen.getByLabelText('Format Code')).toBeInTheDocument();
  });

  it('shows active state for formatting buttons', () => {
    (useToolbarState as Mock).mockReturnValue({
      ...defaultState,
      isBold: true,
      isItalic: true,
    });

    render(<Toolbar />);

    const boldBtn = screen.getByLabelText('Format Bold');
    const italicBtn = screen.getByLabelText('Format Italics');

    expect(boldBtn).toHaveAttribute('data-variant', 'secondary');
    expect(italicBtn).toHaveAttribute('data-variant', 'secondary');
  });

  it('calls handleBlockTypeChange when block type changes', () => {
    render(<Toolbar />);

    fireEvent.click(screen.getByTestId('block-type-option-h1'));

    expect(defaultState.handleBlockTypeChange).toHaveBeenCalledWith('h1');
  });

  it('renders block type as a Lumia dropdown (not a native select)', () => {
    render(<Toolbar />);

    const dropdown = screen.getByTestId('block-type-dropdown');
    expect(dropdown).toHaveAttribute('aria-label', 'Block Type');
    expect(dropdown).toHaveAttribute('data-value', 'paragraph');
  });

  it('calls handleFontChange when font changes', () => {
    render(<Toolbar />);

    const combobox = screen.getByTestId('font-combobox');
    fireEvent.click(combobox);

    expect(defaultState.handleFontChange).toHaveBeenCalledWith('roboto');
  });

  it('dispatches format commands when buttons clicked', () => {
    render(<Toolbar />);

    fireEvent.click(screen.getByLabelText('Format Bold'));
    expect(mockEditor.dispatchCommand).toHaveBeenCalledWith(
      expect.anything(),
      'bold',
    );

    fireEvent.click(screen.getByLabelText('Format Italics'));
    expect(mockEditor.dispatchCommand).toHaveBeenCalledWith(
      expect.anything(),
      'italic',
    );
  });

  it('handles link insertion', () => {
    render(<Toolbar />);

    fireEvent.click(screen.getByLabelText('Insert Link'));
    expect(defaultState.insertLink).toHaveBeenCalled();
  });

  it('renders link popover content when open', () => {
    (useToolbarState as Mock).mockReturnValue({
      ...defaultState,
      isPopoverOpen: true,
      linkUrl: 'https://test.com',
    });

    render(<Toolbar />);

    const input = screen.getByTestId('link-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('https://test.com');
  });

  it('calls onLinkSubmit when enter pressed in link input', () => {
    (useToolbarState as Mock).mockReturnValue({
      ...defaultState,
      isPopoverOpen: true,
    });

    render(<Toolbar />);

    const input = screen.getByTestId('link-input');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(defaultState.onLinkSubmit).toHaveBeenCalled();
  });

  it('calls startLink and toggleNumberedList callbacks', () => {
    render(<Toolbar />);

    fireEvent.click(screen.getByLabelText('Bullet List'));
    expect(defaultState.toggleBulletList).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText('Numbered List'));
    expect(defaultState.toggleNumberedList).toHaveBeenCalled();
  });

  it('disables link button when not editable', () => {
    (useToolbarState as Mock).mockReturnValue({
      ...defaultState,
      isEditable: false,
    });

    render(<Toolbar />);

    expect(screen.getByLabelText('Insert Link')).toBeDisabled();
  });
});
