/**
 * Integration tests for InsertStatusPlugin.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ParagraphNode, $getRoot, LexicalEditor } from 'lexical';
import { StatusNode } from '../nodes/StatusNode/StatusNode';
import {
  InsertStatusPlugin,
  INSERT_STATUS_COMMAND,
} from './InsertStatusPlugin';

let capturedEditor: LexicalEditor | null = null;
const EditorCapture = () => {
  const [editor] = useLexicalComposerContext();
  capturedEditor = editor;
  return null;
};

describe('InsertStatusPlugin Integration', () => {
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
          namespace: 'InsertStatusIntegration',
          nodes: [StatusNode, ParagraphNode],
          onError: (error) => console.error(error),
        }}
      >
        <RichTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={<div>Type here...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <InsertStatusPlugin />
        <EditorCapture />
      </LexicalComposer>,
    );
  };

  it('inserts status node with success color', async () => {
    renderEditor();
    await vi.waitFor(() => expect(capturedEditor).not.toBeNull());

    capturedEditor!.update(() => {
      capturedEditor!.dispatchCommand(INSERT_STATUS_COMMAND, {
        text: 'Done',
        color: 'success',
      });
    });

    capturedEditor!.read(() => {
      const root = $getRoot();
      expect(root.getChildrenSize()).toBeGreaterThan(0);
    });
  });

  it('inserts status node with warning color', async () => {
    renderEditor();
    await vi.waitFor(() => expect(capturedEditor).not.toBeNull());

    capturedEditor!.update(() => {
      capturedEditor!.dispatchCommand(INSERT_STATUS_COMMAND, {
        text: 'In Progress',
        color: 'warning',
      });
    });

    capturedEditor!.read(() => {
      const root = $getRoot();
      expect(root.getChildrenSize()).toBeGreaterThan(0);
    });
  });

  it('inserts status node with error color', async () => {
    renderEditor();
    await vi.waitFor(() => expect(capturedEditor).not.toBeNull());

    capturedEditor!.update(() => {
      capturedEditor!.dispatchCommand(INSERT_STATUS_COMMAND, {
        text: 'Failed',
        color: 'error',
      });
    });

    capturedEditor!.read(() => {
      const root = $getRoot();
      expect(root.getChildrenSize()).toBeGreaterThan(0);
    });
  });

  it('inserts status node with info color', async () => {
    renderEditor();
    await vi.waitFor(() => expect(capturedEditor).not.toBeNull());

    capturedEditor!.update(() => {
      capturedEditor!.dispatchCommand(INSERT_STATUS_COMMAND, {
        text: 'New',
        color: 'info',
      });
    });

    capturedEditor!.read(() => {
      const root = $getRoot();
      expect(root.getChildrenSize()).toBeGreaterThan(0);
    });
  });
});
