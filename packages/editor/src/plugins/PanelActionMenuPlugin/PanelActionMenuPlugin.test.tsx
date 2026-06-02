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

// BUG-LDS-6: Lumia icon mock
vi.mock('@lumia-ui/icons', () => ({
  Icon: ({ name, ...props }: { name: string; [k: string]: unknown }) => (
    <span
      data-lumia-icon={name}
      data-testid={`lumia-icon-${name}`}
      {...props}
    />
  ),
}));

// Mock UI components to simplify testing structure
vi.mock('@lumia-ui/components', () => ({
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
  PopoverContent: ({
    children,
    onKeyDown,
  }: {
    children: React.ReactNode;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onKeyDown?: (e: any) => void;
  }) => (
    <div data-testid="popover-content" onKeyDown={onKeyDown}>
      {children}
    </div>
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

  it('hides menu when the panel is removed from the document (BUG-LDS-6: trigger persists with panel, not with caret)', async () => {
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
      // Select inside panel so the panel mounts.
      panel.selectStart();
    });

    await waitFor(() => {
      expect(screen.getByTestId('title-input')).toBeInTheDocument();
    });

    // BUG-LDS-6: moving the caret OUT of the panel must NOT hide the trigger.
    // The trigger lives at the panel header and stays visible as long as the
    // panel is in the document. This is the Notion / Linear / Coda pattern
    // (the variant icon at the header is always visible and clickable).
    await editor.update(() => {
      const root = $getRoot();
      const paragraph = $createParagraphNode();
      root.append(paragraph);
      paragraph.select();
    });

    // Still present — caret moved but panel still exists.
    await waitFor(() => {
      expect(screen.getByTestId('title-input')).toBeInTheDocument();
    });

    // Now REMOVE the panel — the trigger should disappear.
    await editor.update(() => {
      const root = $getRoot();
      const children = root.getChildren();
      const panel = children.find((n) => n.getType() === 'panel-block');
      if (panel) panel.remove();
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

describe('PanelActionMenuPlugin — BUG-LDS-6 variant picker', () => {
  let container: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('trigger renders the CURRENT variant as a Lumia icon', async () => {
    const { editor } = renderWithEditor(
      <PanelActionMenuPlugin anchorElem={container} />,
    );

    await editor.update(() => {
      const root = $getRoot();
      const panel = $createPanelBlockNode({
        variant: 'warning',
        title: 'Warning Panel',
      });
      panel.append($createParagraphNode());
      root.append(panel);
      panel.selectStart();
    });

    await waitFor(() => {
      const trigger = document.querySelector(
        '[data-lumia-component="panel-variant-trigger"]',
      );
      expect(trigger).not.toBeNull();
      expect(trigger?.getAttribute('data-current-variant')).toBe('warning');
      // BUG-LDS-6: trigger must render the Lumia icon mapped to "warning"
      // (registry ID `alert`), NOT a lucide-react component. The popover
      // content also renders an `alert` icon for the variant grid, so
      // getAllByTestId returns at least one match.
      expect(screen.getAllByTestId('lumia-icon-alert').length).toBeGreaterThan(
        0,
      );
    });
  });

  it('trigger flips icon when variant changes externally', async () => {
    const { editor } = renderWithEditor(
      <PanelActionMenuPlugin anchorElem={container} />,
    );

    let panelKey = '';
    await editor.update(() => {
      const root = $getRoot();
      const panel = $createPanelBlockNode({
        variant: 'info',
        title: 'Info Panel',
      });
      panel.append($createParagraphNode());
      root.append(panel);
      panel.selectStart();
      panelKey = panel.getKey();
    });

    await waitFor(() => {
      // Both the trigger AND the popover content show the info icon.
      expect(screen.getAllByTestId('lumia-icon-info').length).toBeGreaterThan(
        0,
      );
    });

    // External variant flip — simulates the per-panel popover updating the
    // existing node in place (no replacement).
    await editor.update(() => {
      const root = $getRoot();
      const panel = root
        .getChildren()
        .find(
          (n) => n.getType() === 'panel-block' && n.getKey() === panelKey,
        ) as PanelBlockNode | undefined;
      if (panel) {
        panel.setVariant('success');
      }
    });

    await waitFor(() => {
      // Lumia icon ID for "success" is `circle-check`.
      expect(
        screen.getAllByTestId('lumia-icon-circle-check').length,
      ).toBeGreaterThan(0);
      // The trigger's data-current-variant attribute must flip too.
      const trigger = document.querySelector(
        '[data-lumia-component="panel-variant-trigger"]',
      );
      expect(trigger?.getAttribute('data-current-variant')).toBe('success');
    });

    // Verify the SAME node was mutated, NOT replaced.
    let stillSameKey = false;
    editor.getEditorState().read(() => {
      const root = $getRoot();
      const panel = root
        .getChildren()
        .find((n) => n.getType() === 'panel-block') as
        | PanelBlockNode
        | undefined;
      stillSameKey = !!panel && panel.getKey() === panelKey;
    });
    expect(stillSameKey).toBe(true);
  });

  it('variant popover renders a radio-group with all 4 Lumia icons', async () => {
    const { editor } = renderWithEditor(
      <PanelActionMenuPlugin anchorElem={container} />,
    );

    await editor.update(() => {
      const root = $getRoot();
      const panel = $createPanelBlockNode({
        variant: 'info',
        title: 'Test',
      });
      panel.append($createParagraphNode());
      root.append(panel);
      panel.selectStart();
    });

    await waitFor(() => {
      // The radiogroup label is required for accessibility.
      const radiogroup = document.querySelector('[role="radiogroup"]');
      expect(radiogroup).not.toBeNull();
      expect(radiogroup?.getAttribute('aria-label')).toBe('Panel type');

      // Four variant rendering surfaces, each rendering a Lumia icon by name.
      // (Trigger may also render an icon, so getAllByTestId.)
      expect(screen.getAllByTestId('lumia-icon-info').length).toBeGreaterThan(
        0,
      );
      expect(screen.getAllByTestId('lumia-icon-alert').length).toBeGreaterThan(
        0,
      );
      expect(
        screen.getAllByTestId('lumia-icon-circle-check').length,
      ).toBeGreaterThan(0);
      expect(
        screen.getAllByTestId('lumia-icon-file-text').length,
      ).toBeGreaterThan(0);
    });
  });

  it('variant radio buttons mark the active variant with aria-checked', async () => {
    const { editor } = renderWithEditor(
      <PanelActionMenuPlugin anchorElem={container} />,
    );

    await editor.update(() => {
      const root = $getRoot();
      const panel = $createPanelBlockNode({
        variant: 'success',
        title: 'Test',
      });
      panel.append($createParagraphNode());
      root.append(panel);
      panel.selectStart();
    });

    await waitFor(() => {
      const successRadio = document.querySelector('[data-variant="success"]');
      expect(successRadio?.getAttribute('aria-checked')).toBe('true');
      const infoRadio = document.querySelector('[data-variant="info"]');
      expect(infoRadio?.getAttribute('aria-checked')).toBe('false');
    });
  });

  it('clicking a variant button updates the existing node (no replace, no scroll jump)', async () => {
    const { editor } = renderWithEditor(
      <PanelActionMenuPlugin anchorElem={container} />,
    );

    let originalKey = '';
    await editor.update(() => {
      const root = $getRoot();
      const panel = $createPanelBlockNode({
        variant: 'info',
        title: 'Original',
      });
      panel.append($createParagraphNode());
      root.append(panel);
      panel.selectStart();
      originalKey = panel.getKey();
    });

    await waitFor(() => {
      expect(document.querySelector('[data-variant="warning"]')).not.toBeNull();
    });

    const warningButton = document.querySelector(
      '[data-variant="warning"]',
    ) as HTMLElement;
    fireEvent.click(warningButton);

    // BUG-LDS-6 contract: existing node is mutated in place, never replaced.
    let finalVariant: string | undefined;
    let finalKey: string | undefined;
    editor.getEditorState().read(() => {
      const root = $getRoot();
      const panel = root
        .getChildren()
        .find((n) => n.getType() === 'panel-block') as
        | PanelBlockNode
        | undefined;
      finalVariant = panel?.getVariant();
      finalKey = panel?.getKey();
    });

    expect(finalVariant).toBe('warning');
    expect(finalKey).toBe(originalKey); // same node, not replaced
  });

  it('arrow-down on popover cycles to the next variant', async () => {
    const { editor } = renderWithEditor(
      <PanelActionMenuPlugin anchorElem={container} />,
    );

    await editor.update(() => {
      const root = $getRoot();
      const panel = $createPanelBlockNode({
        variant: 'info',
        title: 'Test',
      });
      panel.append($createParagraphNode());
      root.append(panel);
      panel.selectStart();
    });

    await waitFor(() => {
      expect(screen.getByTestId('popover-content')).toBeInTheDocument();
    });

    const popoverContent = screen.getByTestId('popover-content');
    fireEvent.keyDown(popoverContent, { key: 'ArrowDown' });

    let nextVariant: string | undefined;
    editor.getEditorState().read(() => {
      const root = $getRoot();
      const panel = root
        .getChildren()
        .find((n) => n.getType() === 'panel-block') as
        | PanelBlockNode
        | undefined;
      nextVariant = panel?.getVariant();
    });

    // info → warning (next in PANEL_VARIANTS order)
    expect(nextVariant).toBe('warning');
  });

  it('arrow-up on popover cycles to the previous variant (wraps around)', async () => {
    const { editor } = renderWithEditor(
      <PanelActionMenuPlugin anchorElem={container} />,
    );

    await editor.update(() => {
      const root = $getRoot();
      const panel = $createPanelBlockNode({
        variant: 'info',
        title: 'Test',
      });
      panel.append($createParagraphNode());
      root.append(panel);
      panel.selectStart();
    });

    await waitFor(() => {
      expect(screen.getByTestId('popover-content')).toBeInTheDocument();
    });

    const popoverContent = screen.getByTestId('popover-content');
    fireEvent.keyDown(popoverContent, { key: 'ArrowUp' });

    let prevVariant: string | undefined;
    editor.getEditorState().read(() => {
      const root = $getRoot();
      const panel = root
        .getChildren()
        .find((n) => n.getType() === 'panel-block') as
        | PanelBlockNode
        | undefined;
      prevVariant = panel?.getVariant();
    });

    // info → wraps to last (note)
    expect(prevVariant).toBe('note');
  });

  it('arrow keys other than the four navigation keys are ignored', async () => {
    const { editor } = renderWithEditor(
      <PanelActionMenuPlugin anchorElem={container} />,
    );

    await editor.update(() => {
      const root = $getRoot();
      const panel = $createPanelBlockNode({
        variant: 'info',
        title: 'Test',
      });
      panel.append($createParagraphNode());
      root.append(panel);
      panel.selectStart();
    });

    await waitFor(() => {
      expect(screen.getByTestId('popover-content')).toBeInTheDocument();
    });

    const popoverContent = screen.getByTestId('popover-content');
    fireEvent.keyDown(popoverContent, { key: 'a' });
    fireEvent.keyDown(popoverContent, { key: 'Enter' });

    let unchanged: string | undefined;
    editor.getEditorState().read(() => {
      const root = $getRoot();
      const panel = root
        .getChildren()
        .find((n) => n.getType() === 'panel-block') as
        | PanelBlockNode
        | undefined;
      unchanged = panel?.getVariant();
    });

    expect(unchanged).toBe('info');
  });
});
