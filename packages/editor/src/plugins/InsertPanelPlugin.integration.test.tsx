/**
 * Integration tests for InsertPanelPlugin.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ParagraphNode, $getRoot, LexicalEditor } from 'lexical';
import { PanelBlockNode } from '../nodes/PanelBlockNode/PanelBlockNode';
import { InsertPanelPlugin, INSERT_PANEL_COMMAND } from './InsertPanelPlugin';

let capturedEditor: LexicalEditor | null = null;
const EditorCapture = () => {
  const [editor] = useLexicalComposerContext();
  capturedEditor = editor;
  return null;
};

describe('InsertPanelPlugin Integration', () => {
  beforeEach(() => {
    capturedEditor = null;
  });

  afterEach(() => {
    cleanup();
  });

  const renderEditor = () => {
    return render(
      <LexicalComposer
        initialConfig={{
          namespace: 'InsertPanelIntegration',
          nodes: [PanelBlockNode, ParagraphNode],
          onError: (error) => console.error(error),
        }}
      >
        <RichTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={<div>Type here...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <InsertPanelPlugin />
        <EditorCapture />
      </LexicalComposer>,
    );
  };

  it('inserts info panel via command', async () => {
    renderEditor();
    await vi.waitFor(() => expect(capturedEditor).not.toBeNull());

    await act(async () => {
      capturedEditor!.update(() => {
        capturedEditor!.dispatchCommand(INSERT_PANEL_COMMAND, {
          variant: 'info',
          title: 'Information',
        });
      });

      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    capturedEditor!.read(() => {
      const root = $getRoot();
      // Editor should have children after insertion
      expect(root.getChildrenSize()).toBeGreaterThan(0);
    });
  });

  it('inserts warning panel via command', async () => {
    renderEditor();
    await vi.waitFor(() => expect(capturedEditor).not.toBeNull());

    await act(async () => {
      capturedEditor!.update(() => {
        capturedEditor!.dispatchCommand(INSERT_PANEL_COMMAND, {
          variant: 'warning',
          title: 'Warning',
        });
      });

      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    capturedEditor!.read(() => {
      const root = $getRoot();
      expect(root.getChildrenSize()).toBeGreaterThan(0);
    });
  });

  it('inserts success panel via command', async () => {
    renderEditor();
    await vi.waitFor(() => expect(capturedEditor).not.toBeNull());

    await act(async () => {
      capturedEditor!.update(() => {
        capturedEditor!.dispatchCommand(INSERT_PANEL_COMMAND, {
          variant: 'success',
          title: 'Success',
        });
      });

      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    capturedEditor!.read(() => {
      const root = $getRoot();
      expect(root.getChildrenSize()).toBeGreaterThan(0);
    });
  });

  it('inserts panel with custom icon', async () => {
    renderEditor();
    await vi.waitFor(() => expect(capturedEditor).not.toBeNull());

    await act(async () => {
      capturedEditor!.update(() => {
        capturedEditor!.dispatchCommand(INSERT_PANEL_COMMAND, {
          variant: 'note',
          title: 'Note',
          icon: 'bookmark',
        });
      });

      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    capturedEditor!.read(() => {
      const root = $getRoot();
      expect(root.getChildrenSize()).toBeGreaterThan(0);
    });
  });

  // BUG-LDS-6 follow-up: empty-panel backspace / delete handlers
  describe('Empty-panel backspace / delete (BUG-LDS-6 follow-up)', () => {
    it('Backspace at start of empty-panel inner paragraph removes the WHOLE panel (not just the inner paragraph)', async () => {
      renderEditor();
      await vi.waitFor(() => expect(capturedEditor).not.toBeNull());

      // Insert a panel — the plugin selects the inner paragraph.
      await act(async () => {
        capturedEditor!.update(() => {
          capturedEditor!.dispatchCommand(INSERT_PANEL_COMMAND, {
            variant: 'info',
            title: 'Info Panel',
          });
        });
        await new Promise((resolve) => setTimeout(resolve, 30));
      });

      // Sanity: there's a panel-block in the root.
      capturedEditor!.read(() => {
        const childTypes = $getRoot()
          .getChildren()
          .map((c) => c.getType());
        expect(childTypes).toContain('panel-block');
      });

      const { KEY_BACKSPACE_COMMAND } = await import('lexical');

      // Dispatch the command OUTSIDE editor.update — Lexical commands
      // wrap themselves in their own update.
      let handled = false;
      await act(async () => {
        handled = capturedEditor!.dispatchCommand(
          KEY_BACKSPACE_COMMAND,
          new KeyboardEvent('keydown', { key: 'Backspace' }),
        );
        await new Promise((resolve) => setTimeout(resolve, 30));
      });

      // The HIGH-priority handler in InsertPanelPlugin should have run
      // and returned true (stopping propagation to rich-text's default).
      expect(handled).toBe(true);

      // The panel is gone — root no longer contains a panel-block.
      capturedEditor!.read(() => {
        const childTypes = $getRoot()
          .getChildren()
          .map((c) => c.getType());
        expect(childTypes).not.toContain('panel-block');
      });
    });

    it('Delete at start of empty-panel inner paragraph removes the WHOLE panel', async () => {
      renderEditor();
      await vi.waitFor(() => expect(capturedEditor).not.toBeNull());

      await act(async () => {
        capturedEditor!.update(() => {
          capturedEditor!.dispatchCommand(INSERT_PANEL_COMMAND, {
            variant: 'warning',
            title: 'Warning Panel',
          });
        });
        await new Promise((resolve) => setTimeout(resolve, 30));
      });

      const { KEY_DELETE_COMMAND } = await import('lexical');

      let handled = false;
      await act(async () => {
        handled = capturedEditor!.dispatchCommand(
          KEY_DELETE_COMMAND,
          new KeyboardEvent('keydown', { key: 'Delete' }),
        );
        await new Promise((resolve) => setTimeout(resolve, 30));
      });

      expect(handled).toBe(true);
      capturedEditor!.read(() => {
        const childTypes = $getRoot()
          .getChildren()
          .map((c) => c.getType());
        expect(childTypes).not.toContain('panel-block');
      });
    });

    it('Backspace when cursor is NOT inside a panel returns false (default handler runs)', async () => {
      renderEditor();
      await vi.waitFor(() => expect(capturedEditor).not.toBeNull());

      const { KEY_BACKSPACE_COMMAND } = await import('lexical');

      // Don't insert a panel — cursor stays in the default root paragraph.
      // Set selection first, then dispatch the command.
      await act(async () => {
        capturedEditor!.update(() => {
          const root = $getRoot();
          const para = root.getFirstChild();
          if (para && 'select' in para && typeof para.select === 'function') {
            (para as unknown as { select: () => void }).select();
          }
        });
        await new Promise((resolve) => setTimeout(resolve, 10));
        // Dispatch outside the update so commands can run their own.
        capturedEditor!.dispatchCommand(
          KEY_BACKSPACE_COMMAND,
          new KeyboardEvent('keydown', { key: 'Backspace' }),
        );
        await new Promise((resolve) => setTimeout(resolve, 30));
      });

      // No panel was inserted, so panel-block is absent before AND after.
      capturedEditor!.read(() => {
        const childTypes = $getRoot()
          .getChildren()
          .map((c) => c.getType());
        expect(childTypes).not.toContain('panel-block');
      });
    });

    it('Backspace at start of NON-empty panel paragraph does NOT remove the panel (default handler runs)', async () => {
      renderEditor();
      await vi.waitFor(() => expect(capturedEditor).not.toBeNull());

      const lexical = await import('lexical');
      const { KEY_BACKSPACE_COMMAND, $createTextNode, $getNodeByKey } = lexical;

      // Insert a panel.
      await act(async () => {
        capturedEditor!.update(() => {
          capturedEditor!.dispatchCommand(INSERT_PANEL_COMMAND, {
            variant: 'info',
            title: 'Info Panel',
          });
        });
        await new Promise((resolve) => setTimeout(resolve, 30));
      });

      // Type content into the panel's inner paragraph so it's no longer
      // "empty" — and capture the panel's key.
      let panelKey: string | undefined;
      await act(async () => {
        capturedEditor!.update(() => {
          const root = $getRoot();
          const panel = root
            .getChildren()
            .find((c) => c.getType() === 'panel-block');
          if (!panel) throw new Error('panel not found');
          panelKey = panel.getKey();
          const inner = (
            panel as unknown as {
              getFirstChild: () => null | {
                append: (n: unknown) => unknown;
                select: () => unknown;
              };
            }
          ).getFirstChild();
          if (!inner) throw new Error('inner paragraph not found');
          const text = $createTextNode('hello');
          inner.append(text);
          inner.select();
        });
        await new Promise((resolve) => setTimeout(resolve, 20));
      });

      // Dispatch backspace. The InsertPanelPlugin handler should return
      // false because the panel is no longer "empty" — the default rich-
      // text handler then removes a single character. The panel itself
      // remains in the tree.
      await act(async () => {
        capturedEditor!.dispatchCommand(
          KEY_BACKSPACE_COMMAND,
          new KeyboardEvent('keydown', { key: 'Backspace' }),
        );
        await new Promise((resolve) => setTimeout(resolve, 30));
      });

      // Panel is still there with the same key.
      capturedEditor!.read(() => {
        const childTypes = $getRoot()
          .getChildren()
          .map((c) => c.getType());
        expect(childTypes).toContain('panel-block');
        if (panelKey) {
          const stillThere = $getNodeByKey(panelKey);
          expect(stillThere).not.toBeNull();
        }
      });
    });

    it('Backspace with cursor NOT at offset 0 inside an empty panel returns false (default handler runs)', async () => {
      renderEditor();
      await vi.waitFor(() => expect(capturedEditor).not.toBeNull());

      const lexical = await import('lexical');
      const { KEY_BACKSPACE_COMMAND, $createTextNode } = lexical;

      // Insert a panel with text content. Then position cursor at end
      // (offset > 0). Our handler should bail and return false.
      let panelKey: string | undefined;
      await act(async () => {
        capturedEditor!.update(() => {
          capturedEditor!.dispatchCommand(INSERT_PANEL_COMMAND, {
            variant: 'info',
            title: 'Info Panel',
          });
        });
        await new Promise((resolve) => setTimeout(resolve, 20));
      });

      await act(async () => {
        capturedEditor!.update(() => {
          const panel = $getRoot()
            .getChildren()
            .find((c) => c.getType() === 'panel-block');
          if (!panel) throw new Error('panel not found');
          panelKey = panel.getKey();
          const inner = (
            panel as unknown as {
              getFirstChild: () => null | {
                append: (n: unknown) => unknown;
                select: (anchor: number, focus: number) => unknown;
              };
            }
          ).getFirstChild();
          if (!inner) throw new Error('inner paragraph missing');
          const text = $createTextNode('hi');
          inner.append(text);
          // Place caret AFTER 'hi' (offset 2) so offset !== 0.
          inner.select(2, 2);
        });
        await new Promise((resolve) => setTimeout(resolve, 20));
      });

      await act(async () => {
        capturedEditor!.dispatchCommand(
          KEY_BACKSPACE_COMMAND,
          new KeyboardEvent('keydown', { key: 'Backspace' }),
        );
        await new Promise((resolve) => setTimeout(resolve, 20));
      });

      // Panel is still there with the same key — only a character was removed.
      capturedEditor!.read(() => {
        const childTypes = $getRoot()
          .getChildren()
          .map((c) => c.getType());
        expect(childTypes).toContain('panel-block');
        if (panelKey) {
          expect(lexical.$getNodeByKey(panelKey)).not.toBeNull();
        }
      });
    });

    it('Backspace with a NON-collapsed selection across the panel returns false', async () => {
      renderEditor();
      await vi.waitFor(() => expect(capturedEditor).not.toBeNull());

      const lexical = await import('lexical');
      const { KEY_BACKSPACE_COMMAND, $createTextNode } = lexical;

      await act(async () => {
        capturedEditor!.update(() => {
          capturedEditor!.dispatchCommand(INSERT_PANEL_COMMAND, {
            variant: 'note',
            title: 'Note Panel',
          });
        });
        await new Promise((resolve) => setTimeout(resolve, 20));
      });

      await act(async () => {
        capturedEditor!.update(() => {
          const panel = $getRoot()
            .getChildren()
            .find((c) => c.getType() === 'panel-block');
          if (!panel) throw new Error('panel not found');
          const inner = (
            panel as unknown as {
              getFirstChild: () => null | {
                append: (n: unknown) => unknown;
                select: (anchor: number, focus: number) => unknown;
              };
            }
          ).getFirstChild();
          if (!inner) throw new Error('inner paragraph missing');
          inner.append($createTextNode('hello'));
          // Non-collapsed: anchor=0, focus=5 (selects 'hello')
          inner.select(0, 5);
        });
        await new Promise((resolve) => setTimeout(resolve, 20));
      });

      await act(async () => {
        capturedEditor!.dispatchCommand(
          KEY_BACKSPACE_COMMAND,
          new KeyboardEvent('keydown', { key: 'Backspace' }),
        );
        await new Promise((resolve) => setTimeout(resolve, 20));
      });

      // Non-collapsed selection: our handler bails early. The default
      // rich-text handler then removes the selected text. The panel
      // itself remains.
      capturedEditor!.read(() => {
        const childTypes = $getRoot()
          .getChildren()
          .map((c) => c.getType());
        expect(childTypes).toContain('panel-block');
      });
    });
  });

  // BUG-LDS-6 follow-up: stale-text-point selection regression.
  // Reproduces the Turbopack-runtime crash
  //   "$getTextNodeOffset: invalid offset N for size M at key K"
  // when a slash-menu-style consumer trims a text node before
  // dispatching INSERT_PANEL_COMMAND but forgets to re-anchor the
  // selection.
  describe('Stale text-point selection regression (BUG-LDS-6 follow-up)', () => {
    it('Inserts panel cleanly when the anchor offset is past the text node end', async () => {
      renderEditor();
      await vi.waitFor(() => expect(capturedEditor).not.toBeNull());

      const lexical = await import('lexical');
      const { $createTextNode } = lexical;

      // Set up: a paragraph with a short text node, then deliberately
      // place the selection at an offset PAST the text node's length
      // (simulating what happens when a typeahead deletes characters
      // but forgets to update the selection).
      await act(async () => {
        capturedEditor!.update(() => {
          const root = $getRoot();
          const para = root.getFirstChild();
          if (!para || !('append' in para)) {
            throw new Error('root must contain a paragraph');
          }
          const txt = $createTextNode('a');
          (para as unknown as { append: (n: unknown) => unknown }).append(txt);
          // text is "a" (size 1). Anchor offset 2 is INVALID.
          const sel = lexical.$createRangeSelection();
          sel.anchor.set(txt.getKey(), 2, 'text');
          sel.focus.set(txt.getKey(), 2, 'text');
          lexical.$setSelection(sel);
        });
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      // Dispatching INSERT_PANEL_COMMAND used to throw
      // "$getTextNodeOffset: invalid offset 2 for size 1". With the
      // defensive `$normalizeSelectionForInsert` guard the offset is
      // clamped to 1 and the panel is inserted cleanly.
      let didThrow = false;
      await act(async () => {
        try {
          capturedEditor!.update(() => {
            capturedEditor!.dispatchCommand(INSERT_PANEL_COMMAND, {
              variant: 'info',
              title: 'Info Panel',
            });
          });
        } catch {
          didThrow = true;
        }
        await new Promise((resolve) => setTimeout(resolve, 30));
      });

      expect(didThrow).toBe(false);

      // A panel-block was inserted.
      capturedEditor!.read(() => {
        const childTypes = $getRoot()
          .getChildren()
          .map((c) => c.getType());
        expect(childTypes).toContain('panel-block');
      });
    });
  });
});
