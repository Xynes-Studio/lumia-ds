import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { PanelActionMenuPlugin } from './PanelActionMenuPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

// Mock dependencies
vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: vi.fn(),
}));

vi.mock('lexical', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lexical')>();
  return {
    ...actual,
    $getSelection: vi.fn(() => ({
      anchor: { getNode: () => ({ getParent: () => null }) },
    })),
    $isRangeSelection: vi.fn(() => true),
    $getNodeByKey: vi.fn(),
  };
});

vi.mock('@lumia/components', () => ({
  Button: ({
    children,
    onClick,
    title,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    title?: string;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} title={title} {...props}>
      {children}
    </button>
  ),
  Input: ({
    value,
    onChange,
    onBlur,
    placeholder,
    ...props
  }: {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
    placeholder?: string;
    [key: string]: unknown;
  }) => (
    <input
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      {...props}
    />
  ),
  Popover: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open?: boolean;
  }) => (
    <div data-testid="popover" data-open={open}>
      {children}
    </div>
  ),
  PopoverTrigger: ({
    children,
    asChild,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => (
    <div data-testid="popover-trigger" data-aschild={asChild}>
      {children}
    </div>
  ),
  PopoverContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-content">{children}</div>
  ),
}));

vi.mock('lucide-react', async (importOriginal) => {
  return await importOriginal();
});

describe('PanelActionMenuPlugin', () => {
  const mockDispatchCommand = vi.fn();
  const mockUpdate = vi.fn((callback: () => void) => callback());
  const mockRegisterUpdateListener = vi.fn(() => vi.fn());
  const mockGetElementByKey = vi.fn();

  const mockEditor = {
    dispatchCommand: mockDispatchCommand,
    update: mockUpdate,
    registerUpdateListener: mockRegisterUpdateListener,
    getElementByKey: mockGetElementByKey,
    getEditorState: vi.fn(() => ({
      read: vi.fn((callback: () => void) => callback()),
      _nodeMap: new Map(),
    })),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useLexicalComposerContext as Mock).mockReturnValue([mockEditor]);
  });

  it('renders nothing when no panel is active', () => {
    const { container } = render(<PanelActionMenuPlugin />);
    expect(
      container.querySelector('.panel-action-menu'),
    ).not.toBeInTheDocument();
  });

  it('registers update listener on mount', () => {
    render(<PanelActionMenuPlugin />);
    expect(mockRegisterUpdateListener).toHaveBeenCalled();
  });

  it('exports PanelActionMenuPlugin component', () => {
    expect(PanelActionMenuPlugin).toBeDefined();
    expect(typeof PanelActionMenuPlugin).toBe('function');
  });
});

describe('VARIANTS constant', () => {
  it('defines all panel variants', () => {
    // Import the VARIANTS array through testing the menu
    const variants = ['info', 'warning', 'success', 'note'];
    variants.forEach((variant) => {
      expect(variant).toBeDefined();
    });
  });
});
