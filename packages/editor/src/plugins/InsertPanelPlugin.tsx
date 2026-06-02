import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils';
import {
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  createCommand,
  LexicalCommand,
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
} from 'lexical';
import { useEffect } from 'react';
import {
  $createPanelBlockNode,
  $isPanelBlockNode,
  PanelBlockNode,
  PanelBlockPayload,
} from '../nodes/PanelBlockNode/PanelBlockNode';

export const INSERT_PANEL_COMMAND: LexicalCommand<PanelBlockPayload> =
  createCommand('INSERT_PANEL_COMMAND');

/**
 * BUG-LDS-6 follow-up: handles backspace / delete on an "empty stale
 * panel" (panel whose only child is an empty paragraph).
 *
 * Why we need a dedicated key handler instead of relying on
 * `PanelBlockNode.collapseAtStart`:
 *   Lexical's `RangeSelection.deleteCharacter` runs a caret-iteration
 *   loop BEFORE `$collapseAtStart`. When the cursor is at offset 0 of
 *   an empty paragraph inside an empty panel, the caret iterator
 *   reaches a `'merge-block'` state with the previous paragraph (the
 *   paragraph BEFORE the panel) and calls `removeText()` — which
 *   collapses the empty inner paragraph but leaves the panel wrapper
 *   intact. `$collapseAtStart` (which would have called
 *   `panel.collapseAtStart` and removed the panel) never runs.
 *
 *   We intercept `KEY_BACKSPACE_COMMAND` / `KEY_DELETE_COMMAND` at
 *   `COMMAND_PRIORITY_HIGH` (higher than rich-text's default
 *   `COMMAND_PRIORITY_EDITOR`) and short-circuit the deletion when the
 *   cursor is inside an empty panel — we explicitly call
 *   `panel.collapseAtStart()` which replaces the whole panel with a
 *   fresh paragraph and moves the caret into it. For every other
 *   cursor position we return `false` to let the default deletion
 *   logic proceed unchanged.
 */
function $isCursorAtStartOfEmptyPanel(): PanelBlockNode | null {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return null;
  if (!selection.isCollapsed()) return null;
  const anchor = selection.anchor;
  // Must be at offset 0 (start of the node) for backspace to "exit" it.
  if (anchor.offset !== 0) return null;
  const anchorNode = anchor.getNode();
  // Walk up looking for a PanelBlockNode ancestor.
  let current:
    | ReturnType<typeof anchorNode.getParent>
    | typeof anchorNode
    | null = anchorNode;
  while (current) {
    if ($isPanelBlockNode(current)) {
      // Use the node's own predicate via the public `collapseAtStart`
      // pre-check — it returns true ONLY for the "empty or
      // single-empty-paragraph child" shape.
      return current.isEmpty() || hasOnlyEmptyParagraph(current)
        ? current
        : null;
    }
    current = current.getParent();
  }
  return null;
}

function hasOnlyEmptyParagraph(panel: PanelBlockNode): boolean {
  const children = panel.getChildren();
  if (children.length !== 1) return false;
  const only = children[0];
  if (!only || only.getType() !== 'paragraph') return false;
  return only.getTextContentSize() === 0;
}

/**
 * BUG-LDS-6 follow-up: defensive selection normalization before
 * `$insertNodeToNearestRoot`.
 *
 * Symptom: if the current `RangeSelection` has a text-point anchor whose
 * offset exceeds the text node's current size (a stale selection — e.g.
 * the slash menu trimmed a text node before dispatching this command),
 * `$insertNodeToNearestRoot` internally calls
 * `$caretFromPoint` → `$getTextPointCaret` → `$getTextNodeOffset`, which
 * THROWS `$getTextNodeOffset: invalid offset N for size M at key K`.
 *
 * Fix: detect that case and clamp the offset to the text node's current
 * end. The slash menu now also re-anchors selection after trimming
 * (see `SlashMenuPlugin.handleSelectCommand`), but this guard makes the
 * insert path resilient against any future caller that leaves the
 * selection in a stale state.
 */
function $normalizeSelectionForInsert(): void {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return;
  for (const point of [selection.anchor, selection.focus]) {
    if (point.type !== 'text') continue;
    const node = point.getNode();
    if (!$isTextNode(node)) continue;
    const size = node.getTextContentSize();
    if (point.offset > size) {
      point.offset = size;
    }
  }
}

/**
 * Test-only exports for BUG-LDS-6 unit tests. These are NOT part of the
 * plugin's public API; their `__test__` prefix signals "do not use in
 * production callers".
 *
 * Exporting the helpers lets us reach branches that are structurally
 * hard to hit from end-to-end integration tests (e.g. the
 * non-RangeSelection early-return that requires forcibly setting a
 * NodeSelection on the editor state).
 */
export const __test__ = {
  $isCursorAtStartOfEmptyPanel,
  hasOnlyEmptyParagraph,
  $normalizeSelectionForInsert,
};

export function InsertPanelPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        INSERT_PANEL_COMMAND,
        (payload) => {
          // BUG-LDS-6 follow-up: defensive selection normalization.
          // Guards against the `$getTextNodeOffset: invalid offset N for
          // size M` crash when this command is dispatched immediately
          // after a caller mutated text content without re-anchoring the
          // selection (e.g. the slash menu typeahead path).
          $normalizeSelectionForInsert();

          // Ensure icon is set based on variant if not provided
          const finalPayload = {
            ...payload,
            icon: payload.icon || payload.variant,
          };
          const panelNode = $createPanelBlockNode(finalPayload);

          // Create an empty paragraph inside the panel for content
          const paragraphNode = $createParagraphNode();
          panelNode.append(paragraphNode);

          // Defensive selection normalization before inserting the panel
          $normalizeSelectionForInsert();

          // Insert the panel at the nearest root
          $insertNodeToNearestRoot(panelNode);

          // Select the paragraph inside the panel so user can start typing
          paragraphNode.select();

          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      // BUG-LDS-6 follow-up: intercept backspace inside an empty panel
      // so the whole panel is removed (not just its inner paragraph).
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        (event) => {
          const panel = $isCursorAtStartOfEmptyPanel();
          if (!panel) return false;
          event?.preventDefault?.();
          // collapseAtStart replaces the panel with a fresh paragraph
          // and moves the caret into it.
          panel.collapseAtStart();
          return true;
        },
        COMMAND_PRIORITY_HIGH,
      ),
      // Symmetrical handler for forward-delete from inside an empty panel.
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        (event) => {
          const panel = $isCursorAtStartOfEmptyPanel();
          if (!panel) return false;
          event?.preventDefault?.();
          panel.collapseAtStart();
          return true;
        },
        COMMAND_PRIORITY_HIGH,
      ),
    );
  }, [editor]);

  return null;
}
