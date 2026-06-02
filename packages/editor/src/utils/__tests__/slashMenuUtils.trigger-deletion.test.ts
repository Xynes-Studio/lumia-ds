/**
 * BUG-LDS-5 / Bug C — slash-menu closes when the `/` trigger is deleted.
 *
 * These tests pin the `hasObservedTextChild` latch added to
 * `processQueryUpdate`. Once the menu has observed a text child carrying the
 * `/` trigger, any subsequent absence (caused by Backspace / Delete on the
 * trigger character) must close the menu.
 *
 * The text-node path is already covered by the existing `slash_removed`
 * close reason (`isSlashStillPresent('', 0)` → false). These tests focus on
 * the empty-element trigger path that was previously sticky.
 */
import { describe, test, expect } from 'vitest';
import { processQueryUpdate } from '../slashMenuUtils';

describe('processQueryUpdate — empty element trigger deletion (BUG-LDS-5 / Bug C)', () => {
  const baseInput = {
    nodeExists: true,
    isElementNode: true,
    hasTextChild: false,
    textContent: '',
    triggerOffset: 0,
    triggerNodeKey: 'p-1',
    hasValidSelection: true,
    selectionNodeKey: 'p-1',
    textNodeKey: null,
    selectionIsTextNode: false,
    cursorOffset: 0,
  };

  test('stays open on the very first tick before / has been committed (hasObservedTextChild=false)', () => {
    const result = processQueryUpdate({
      ...baseInput,
      hasObservedTextChild: false,
    });
    expect(result.shouldClose).toBe(false);
    expect(result.shouldUpdate).toBe(false);
  });

  test('closes when the text child disappears after having been observed (Backspace on /)', () => {
    const result = processQueryUpdate({
      ...baseInput,
      hasObservedTextChild: true,
    });
    expect(result.shouldClose).toBe(true);
    expect(result.closeReason).toBe('slash_removed');
  });

  test('default hasObservedTextChild=undefined preserves backward compatibility', () => {
    // Existing callers that do not yet pass the flag continue to see the
    // "stays open waiting for text" branch on the empty-element case.
    const result = processQueryUpdate(baseInput);
    expect(result.shouldClose).toBe(false);
    expect(result.shouldUpdate).toBe(false);
  });

  test('text-node path closes on Backspace regardless of hasObservedTextChild', () => {
    // Trigger at offset 6 of "Hello " (after space); user backspaces away the /
    // → text content becomes "Hello " (length 6); text[6] === undefined.
    const result = processQueryUpdate({
      ...baseInput,
      isElementNode: false,
      hasTextChild: true,
      textContent: 'Hello ',
      triggerOffset: 6,
      textNodeKey: 'p-1',
      selectionIsTextNode: true,
      hasObservedTextChild: true,
    });
    expect(result.shouldClose).toBe(true);
    expect(result.closeReason).toBe('slash_removed');
  });

  test('multi-char deletion that spans the / trigger still closes the menu', () => {
    // User types "/img", then selects "/img" and presses Delete → text becomes "".
    const result = processQueryUpdate({
      ...baseInput,
      isElementNode: false,
      hasTextChild: true,
      textContent: '',
      triggerOffset: 0,
      textNodeKey: 'p-1',
      selectionIsTextNode: true,
      hasObservedTextChild: true,
    });
    expect(result.shouldClose).toBe(true);
    expect(result.closeReason).toBe('slash_removed');
  });
});
