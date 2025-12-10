import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PanelActionMenuPlugin } from './PanelActionMenuPlugin';
import { renderWithEditor } from '../../test-utils/LexicalTestHarness';
import {
  $createPanelBlockNode,
  PanelBlockNode,
} from '../../nodes/PanelBlockNode/PanelBlockNode';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';

// Mock Lucide icons
vi.mock('lucide-react', async (importOriginal) => {
  return await importOriginal();
});

// Mock UI components to simplify testing structure
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
    <button
      onClick={onClick}
      title={title}
      data-testid="action-button"
      {...props}
    >
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
      data-testid="title-input"
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

describe('PanelActionMenuPlugin Integration', () => {
  let container: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
    // Create a container for the portal
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('renders nothing initially', () => {
    renderWithEditor(<PanelActionMenuPlugin anchorElem={container} />);
    expect(screen.queryByTestId('popover')).not.toBeInTheDocument();
  });

  it('shows menu when panel is selected', async () => {
    const { editor } = renderWithEditor(
      <PanelActionMenuPlugin anchorElem={container} />,
    );

    await editor.update(() => {
      const root = $getRoot();
      const panel = $createPanelBlockNode({
        variant: 'info',
        title: 'Test Panel',
      });
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode('Content'));
      panel.append(paragraph);
      root.append(panel);

      // Select the paragraph inside the panel
      paragraph.select();
    });

    // Wait for the update listener to fire and state to update
    await waitFor(() => {
      const input = screen.getByTestId('title-input') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.value).toBe('Test Panel');
    });
  });

  it('hides menu when selection moves outside panel', async () => {
    const { editor } = renderWithEditor(
      <PanelActionMenuPlugin anchorElem={container} />,
    );

    // Setup panel
    await editor.update(() => {
      const root = $getRoot();
      const panel = $createPanelBlockNode({
        variant: 'info',
        title: 'Test Panel',
      });
      panel.append($createParagraphNode());
      root.append(panel);

      // Select inside panel
      panel.selectStart();
    });

    await waitFor(() => {
      expect(screen.getByTestId('title-input')).toBeInTheDocument();
    });

    // Move selection outside
    await editor.update(() => {
      const root = $getRoot();
      const paragraph = $createParagraphNode();
      root.append(paragraph);
      paragraph.select();
    });

    await waitFor(
      () => {
        expect(screen.queryByTestId('title-input')).not.toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });

  it('updates panel title on input change and blur', async () => {
    const { editor } = renderWithEditor(
      <PanelActionMenuPlugin anchorElem={container} />,
    );

    await editor.update(() => {
      const root = $getRoot();
      const panel = $createPanelBlockNode({
        variant: 'info',
        title: 'Original',
      });
      panel.append($createParagraphNode());
      root.append(panel);
      panel.selectStart();
    });

    await waitFor(() => {
      expect(screen.getByTestId('title-input')).toBeInTheDocument();
    });

    const input = screen.getByTestId('title-input');

    // Simulate typing
    fireEvent.change(input, { target: { value: 'New Title' } });
    fireEvent.blur(input);

    // Verify logic update in editor state
    let title = '';
    editor.getEditorState().read(() => {
      const root = $getRoot();
      const children = root.getChildren();
      const panel = children.find(
        (node) => node.getType() === 'panel-block',
      ) as PanelBlockNode;
      if (panel) {
        title = panel.getTitle() || '';
      }
    });

    expect(title).toBe('New Title');
  });

  it('updates input when panel title changes externally', async () => {
    const { editor } = renderWithEditor(
      <PanelActionMenuPlugin anchorElem={container} />,
    );

    // Initial setup
    await editor.update(() => {
      const root = $getRoot();
      const panel = $createPanelBlockNode({
        variant: 'info',
        title: 'Initial',
      });
      panel.append($createParagraphNode());
      root.append(panel);
      panel.selectStart();
    });

    await waitFor(() => {
      expect(
        (screen.getByTestId('title-input') as HTMLInputElement).value,
      ).toBe('Initial');
    });

    // External update
    await editor.update(() => {
      const root = $getRoot();

      // Ensure we get the panel properly
      let panel = root.getFirstChild();

      // If it's the default paragraph, remove it or find the panel
      if (panel && panel.getType() === 'paragraph') {
        // In setup we appended panel after paragraph?
        // Actually in setup we cleared? No.
        // Let's just find the panel.
        const children = root.getChildren();
        panel =
          children.find((node) => node.getType() === 'panel-block') || null;
      }

      if (!panel) throw new Error('Panel not found');

      // Verify type
      if (panel.getType() !== 'panel-block') {
        throw new Error(`Expected panel-block but got ${panel.getType()}`);
      }

      (panel as PanelBlockNode).setTitle('Updated External');
    });

    await waitFor(() => {
      expect(
        (screen.getByTestId('title-input') as HTMLInputElement).value,
      ).toBe('Updated External');
    });
  });
});
