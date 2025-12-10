/**
 * Test utilities for Lexical editor testing.
 *
 * @example
 * import { renderWithEditor, simulateTyping } from '../test-utils';
 *
 * const { editor } = renderWithEditor(<MyPlugin />);
 * await simulateTyping(editor, '/table');
 */
export {
  renderWithEditor,
  waitForEditorUpdate,
  simulateTyping,
  clearEditor,
  getEditorText,
  DEFAULT_TEST_NODES,
  type TestEditorConfig,
  type EditorRenderResult,
} from './LexicalTestHarness';
