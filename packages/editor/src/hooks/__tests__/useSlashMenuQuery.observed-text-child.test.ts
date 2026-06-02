/**
 * BUG-LDS-5 / Bug C — useSlashMenuQuery latches the "observed text child" flag
 * and forwards it into processQueryUpdate so empty-element triggers close on
 * Backspace.
 *
 * We don't need a real Lexical editor here — the hook only consumes a single
 * editor method (`registerUpdateListener`) and reads via Lexical scope helpers
 * which are mocked at the module boundary. We assert the input we pass to
 * the pure `processQueryUpdate` and let the slashMenuUtils tests cover the
 * decision logic.
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSlashMenuQuery } from '../useSlashMenuQuery';

// Capture every `processQueryUpdate` call made by the hook so we can inspect
// what `hasObservedTextChild` value flowed through. The mock keeps the real
// behaviour for downstream `if (result.shouldClose)` / `if (result.shouldUpdate)`
// branches in the hook.
const processQueryUpdateMock = vi.fn().mockReturnValue({
  shouldUpdate: false,
  shouldClose: false,
  query: '',
});

vi.mock('../../utils/slashMenuUtils', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../utils/slashMenuUtils')>();
  return {
    ...actual,
    processQueryUpdate: (input: unknown) => processQueryUpdateMock(input),
  };
});

// Lexical scope helpers are touched inside `editorState.read(...)`. We mock
// the minimum surface and drive the input by adjusting the mock return value.
const $getSelectionMock = vi.fn();
const $isRangeSelectionMock = vi.fn();
const $getNodeByKeyMock = vi.fn();
const $isTextNodeMock = vi.fn();
const $isElementNodeMock = vi.fn();

vi.mock('lexical', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lexical')>();
  return {
    ...actual,
    $getSelection: () => $getSelectionMock(),
    $isRangeSelection: (s: unknown) => $isRangeSelectionMock(s),
    $getNodeByKey: (k: unknown) => $getNodeByKeyMock(k),
    $isTextNode: (n: unknown) => $isTextNodeMock(n),
    $isElementNode: (n: unknown) => $isElementNodeMock(n),
  };
});

interface MockEditor {
  registerUpdateListener: ReturnType<typeof vi.fn>;
}

function makeFakeEditor(): MockEditor {
  return {
    registerUpdateListener: vi.fn(() => () => undefined),
  };
}

function triggerUpdate(editor: MockEditor) {
  const callback = editor.registerUpdateListener.mock.calls[0]?.[0];
  // Provide a minimal editorState whose `.read(fn)` just invokes `fn`.
  callback?.({
    editorState: {
      read: (fn: () => void) => fn(),
    },
  });
}

describe('useSlashMenuQuery — hasObservedTextChild latch (BUG-LDS-5 / Bug C)', () => {
  beforeEach(() => {
    processQueryUpdateMock.mockClear();
    $getSelectionMock.mockReset();
    $isRangeSelectionMock.mockReset();
    $getNodeByKeyMock.mockReset();
    $isTextNodeMock.mockReset();
    $isElementNodeMock.mockReset();
  });

  test('first tick on an empty element passes hasObservedTextChild=false', () => {
    const editor = makeFakeEditor();
    const emptyElement = { kind: 'element-no-text' };

    $getNodeByKeyMock.mockReturnValue(emptyElement);
    $isElementNodeMock.mockImplementation((n) => n === emptyElement);
    $isTextNodeMock.mockReturnValue(false);
    // Element has no firstChild → hasTextChild stays false.
    Object.assign(emptyElement, { getFirstChild: () => null });
    $isRangeSelectionMock.mockReturnValue(false);

    renderHook(() =>
      useSlashMenuQuery({
        editor: editor as never,
        isOpen: true,
        triggerNodeKey: 'p-1',
        triggerOffset: 0,
        onUpdateQuery: vi.fn(),
        onClose: vi.fn(),
      }),
    );

    triggerUpdate(editor);

    expect(processQueryUpdateMock).toHaveBeenCalledTimes(1);
    const input = processQueryUpdateMock.mock.calls[0][0];
    expect(input.hasTextChild).toBe(false);
    expect(input.hasObservedTextChild).toBe(false);
  });

  test('subsequent ticks pass hasObservedTextChild=true once a text child has been seen', () => {
    const editor = makeFakeEditor();
    const textNode = { kind: 'text-/' };
    const element = { kind: 'element', getFirstChild: () => textNode };

    Object.assign(textNode, {
      getTextContent: () => '/',
      getKey: () => 'text-1',
    });

    $getNodeByKeyMock.mockReturnValue(element);
    $isElementNodeMock.mockImplementation((n) => n === element);
    $isTextNodeMock.mockImplementation((n) => n === textNode);
    $isRangeSelectionMock.mockReturnValue(false);

    renderHook(() =>
      useSlashMenuQuery({
        editor: editor as never,
        isOpen: true,
        triggerNodeKey: 'p-1',
        triggerOffset: 0,
        onUpdateQuery: vi.fn(),
        onClose: vi.fn(),
      }),
    );

    // Tick 1: text child observed → hasObservedTextChild flips to true on this call.
    triggerUpdate(editor);
    expect(processQueryUpdateMock).toHaveBeenCalledTimes(1);
    expect(processQueryUpdateMock.mock.calls[0][0].hasObservedTextChild).toBe(
      true,
    );

    // Tick 2: simulate user pressing Backspace — element now has no first child.
    element.getFirstChild = () => null as never;
    triggerUpdate(editor);

    expect(processQueryUpdateMock).toHaveBeenCalledTimes(2);
    const secondInput = processQueryUpdateMock.mock.calls[1][0];
    expect(secondInput.hasTextChild).toBe(false);
    // The latch carries forward — the pure fn will now return shouldClose=true.
    expect(secondInput.hasObservedTextChild).toBe(true);
  });

  test('latch resets when the menu closes (isOpen flips false)', () => {
    const editor = makeFakeEditor();
    const textNode = {
      kind: 'text',
      getTextContent: () => '/',
      getKey: () => 't',
    };
    const element = { kind: 'element', getFirstChild: () => textNode };

    $getNodeByKeyMock.mockReturnValue(element);
    $isElementNodeMock.mockImplementation((n) => n === element);
    $isTextNodeMock.mockImplementation((n) => n === textNode);
    $isRangeSelectionMock.mockReturnValue(false);

    const { rerender } = renderHook(
      ({ isOpen }) =>
        useSlashMenuQuery({
          editor: editor as never,
          isOpen,
          triggerNodeKey: 'p-1',
          triggerOffset: 0,
          onUpdateQuery: vi.fn(),
          onClose: vi.fn(),
        }),
      { initialProps: { isOpen: true } },
    );

    triggerUpdate(editor); // latch becomes true.
    expect(processQueryUpdateMock.mock.calls[0][0].hasObservedTextChild).toBe(
      true,
    );

    // Close the menu → effect cleanup resets the latch ref.
    rerender({ isOpen: false });

    // Re-open on a fresh trigger; the hook re-registers, and the first tick on
    // an empty element must again pass hasObservedTextChild=false.
    element.getFirstChild = () => null as never;
    editor.registerUpdateListener.mockClear();
    processQueryUpdateMock.mockClear();
    rerender({ isOpen: true });

    triggerUpdate(editor);
    expect(processQueryUpdateMock.mock.calls[0][0].hasObservedTextChild).toBe(
      false,
    );
  });
});
