/**
 * LexicalTestHarness - Shared test utilities for Lexical editor testing.
 *
 * Provides a standardized way to test hooks and plugins that depend on
 * the Lexical editor context.
 */
import React, { ReactElement } from 'react';
import { render, RenderResult } from '@testing-library/react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  LexicalEditor,
  ParagraphNode,
  TextNode,
  $getRoot,
  $createParagraphNode,
  $createTextNode,
} from 'lexical';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { TableNode, TableRowNode, TableCellNode } from '@lexical/table';
import { ImageBlockNode } from '../nodes/ImageBlockNode/ImageBlockNode';
import { VideoBlockNode } from '../nodes/VideoBlockNode';
import { FileBlockNode } from '../nodes/FileBlockNode/FileBlockNode';
import { PanelBlockNode } from '../nodes/PanelBlockNode/PanelBlockNode';
import { StatusNode } from '../nodes/StatusNode/StatusNode';

/**
 * Default nodes for test editor
 */
export const DEFAULT_TEST_NODES = [
  ParagraphNode,
  TextNode,
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  TableNode,
  TableRowNode,
  TableCellNode,
  ImageBlockNode,
  VideoBlockNode,
  FileBlockNode,
  PanelBlockNode,
  StatusNode,
];

/**
 * Editor config for testing
 */
export interface TestEditorConfig {
  namespace?: string;
  nodes?: typeof DEFAULT_TEST_NODES;
  initialContent?: string;
  onError?: (error: Error) => void;
}

/**
 * Result from renderWithEditor
 */
export interface EditorRenderResult extends RenderResult {
  editor: LexicalEditor;
}

// Captured editor reference
let capturedEditor: LexicalEditor | null = null;

const EditorCapture = () => {
  const [editor] = useLexicalComposerContext();
  capturedEditor = editor;
  return null;
};

/**
 * Creates a test wrapper with LexicalComposer
 */
function createTestWrapper(config: TestEditorConfig = {}) {
  const {
    namespace = 'test-editor',
    nodes = DEFAULT_TEST_NODES,
    onError = (error) => {
      throw error;
    },
  } = config;

  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <LexicalComposer
        initialConfig={{
          namespace,
          nodes,
          onError,
        }}
      >
        <RichTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={<div>Type here...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <EditorCapture />
        {children}
      </LexicalComposer>
    );
  };
}

/**
 * Render a component within a Lexical editor context
 */
export function renderWithEditor(
  ui: ReactElement,
  config: TestEditorConfig = {},
): EditorRenderResult {
  capturedEditor = null;
  const Wrapper = createTestWrapper(config);
  const result = render(ui, { wrapper: Wrapper });

  if (!capturedEditor) {
    throw new Error(
      'Editor was not captured. Ensure EditorCapture is mounted.',
    );
  }

  return {
    ...result,
    editor: capturedEditor,
  };
}

/**
 * Wait for editor to process updates
 */
export function waitForEditorUpdate(
  editor: LexicalEditor,
  timeout = 100,
): Promise<void> {
  return new Promise((resolve) => {
    const removeListener = editor.registerUpdateListener(() => {
      removeListener();
      resolve();
    });
    setTimeout(resolve, timeout);
  });
}

/**
 * Simulate typing text into the editor
 */
export function simulateTyping(
  editor: LexicalEditor,
  text: string,
): Promise<void> {
  return new Promise((resolve) => {
    editor.update(() => {
      const root = $getRoot();
      const paragraph = root.getFirstChild() ?? $createParagraphNode();
      if (!root.getFirstChild()) {
        root.append(paragraph);
      }
      const textNode = $createTextNode(text);
      paragraph.append(textNode);
      textNode.select();
    });
    setTimeout(resolve, 50);
  });
}

/**
 * Clear editor content
 */
export function clearEditor(editor: LexicalEditor): void {
  editor.update(() => {
    const root = $getRoot();
    root.clear();
    const paragraph = $createParagraphNode();
    root.append(paragraph);
    paragraph.select();
  });
}

/**
 * Get editor text content
 */
export function getEditorText(editor: LexicalEditor): string {
  let text = '';
  editor.getEditorState().read(() => {
    text = $getRoot().getTextContent();
  });
  return text;
}
