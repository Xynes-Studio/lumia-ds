/**
 * BUG-UNIVERSAL — shared cursor token for every interactive primitive in Lumia DS.
 *
 * Contract:
 *   - Action-triggering elements (buttons, chips, list rows, anchors, switchers)
 *     MUST opt into `interactiveCursor` so the cursor reflects pointer (enabled)
 *     and not-allowed (disabled / aria-disabled).
 *   - Form text inputs (Input, Textarea, Combobox input) keep their native
 *     `cursor: text` and do NOT opt in.
 *   - `MenuItem` and `ContextMenu.Item` (Radix-based) keep `cursor-default` per
 *     Radix convention — pointer cursor inside controlled menus reads off in
 *     native idioms. See packages/components/README.md "Interactive cursor
 *     contract" for the documented exception.
 *
 * Usage — static (HTML `disabled` / `aria-disabled` attribute drives state):
 *
 *   import { interactiveCursor } from '../lib/interactive-styles';
 *   const baseClasses = `inline-flex items-center ${interactiveCursor} ...`;
 *
 * Usage — stateful (component prop like `isDisabled` drives state because the
 * element is NOT a real `<button>` / `<input>`, so the Tailwind `disabled:`
 * variant doesn't apply):
 *
 *   import { interactiveCursorStateful } from '../lib/interactive-styles';
 *   className={cn(baseClasses, interactiveCursorStateful(isDisabled), ...)}
 */

/**
 * Static cursor token. Pointer when enabled; not-allowed when the element
 * carries `disabled` or `aria-disabled="true"`. Suitable for real
 * `<button>` / `<input>` / `<a>` elements where Tailwind's `disabled:` and
 * `aria-disabled:` variants fire automatically from the underlying HTML
 * attribute.
 */
export const interactiveCursor =
  'cursor-pointer disabled:cursor-not-allowed aria-disabled:cursor-not-allowed';

/**
 * Stateful cursor token for component-driven disabled state (e.g. `Radio`,
 * `Checkbox`, `Switch` wrapper labels — elements whose disabled posture is
 * derived from an `isDisabled` prop rather than the HTML `disabled` attribute).
 *
 * Returns `cursor-not-allowed` when disabled; `cursor-pointer` otherwise.
 */
export const interactiveCursorStateful = (
  isDisabled: boolean | undefined,
): 'cursor-not-allowed' | 'cursor-pointer' =>
  isDisabled ? 'cursor-not-allowed' : 'cursor-pointer';
