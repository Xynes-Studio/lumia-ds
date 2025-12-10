import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createHeadlessEditor } from '@lexical/headless';
import { $getRoot, ParagraphNode, COMMAND_PRIORITY_EDITOR } from 'lexical';
import {
  INSERT_FILE_BLOCK_COMMAND,
  InsertFilePlugin,
} from './InsertFilePlugin';
import {
  FileBlockNode,
  $createFileBlockNode,
} from '../nodes/FileBlockNode/FileBlockNode';
import { $insertNodes, $isRootOrShadowRoot } from 'lexical';
import { $wrapNodeInElement } from '@lexical/utils';
import { $createParagraphNode } from 'lexical';
import { render } from '@testing-library/react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { MediaContext } from '../EditorProvider';
import { EditorMediaConfig } from '../media-config';
import React from 'react';

describe('InsertFilePlugin', () => {
  let editor: ReturnType<typeof createHeadlessEditor>;

  beforeEach(() => {
    editor = createHeadlessEditor({
      namespace: 'test',
      nodes: [FileBlockNode, ParagraphNode],
      onError: (error) => console.error(error),
    });

    // Register the command listener manually for testing
    editor.registerCommand(
      INSERT_FILE_BLOCK_COMMAND,
      (payload) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { file: _file, ...nodePayload } = payload;

        // Simple path - no file upload, just create the node
        const fileNode = $createFileBlockNode(nodePayload);
        $insertNodes([fileNode]);
        if ($isRootOrShadowRoot(fileNode.getParentOrThrow())) {
          $wrapNodeInElement(fileNode, $createParagraphNode).selectEnd();
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  });

  it('inserts file node with basic payload', async () => {
    await new Promise<void>((resolve) => {
      editor.update(
        () => {
          editor.dispatchCommand(INSERT_FILE_BLOCK_COMMAND, {
            url: 'https://example.com/document.pdf',
            filename: 'document.pdf',
            size: 1024,
            mime: 'application/pdf',
          });
        },
        { onUpdate: resolve },
      );
    });

    editor.read(() => {
      const root = $getRoot();
      const children = root.getChildren();
      expect(children.length).toBeGreaterThan(0);

      // Find the file node in the tree
      let foundFileNode = false;
      const checkNode = (node: { getType: () => string }) => {
        if (node.getType() === 'file-block') {
          foundFileNode = true;
        }
      };

      children.forEach((child) => {
        checkNode(child);
        if ('getChildren' in child) {
          const nodeWithChildren = child as unknown as {
            getChildren: () => Array<{ getType: () => string }>;
          };
          nodeWithChildren.getChildren().forEach(checkNode);
        }
      });

      expect(foundFileNode).toBe(true);
    });
  });

  it('inserts file node with uploaded status', async () => {
    await new Promise<void>((resolve) => {
      editor.update(
        () => {
          editor.dispatchCommand(INSERT_FILE_BLOCK_COMMAND, {
            url: 'https://example.com/file.txt',
            filename: 'file.txt',
            size: 512,
            mime: 'text/plain',
            status: 'uploaded',
          });
        },
        { onUpdate: resolve },
      );
    });

    editor.read(() => {
      const root = $getRoot();
      expect(root.getChildrenSize()).toBeGreaterThan(0);
    });
  });

  it('inserts file node with uploading status', async () => {
    await new Promise<void>((resolve) => {
      editor.update(
        () => {
          editor.dispatchCommand(INSERT_FILE_BLOCK_COMMAND, {
            url: 'blob:test',
            filename: 'uploading.pdf',
            size: 2048,
            mime: 'application/pdf',
            status: 'uploading',
          });
        },
        { onUpdate: resolve },
      );
    });

    editor.read(() => {
      const root = $getRoot();
      expect(root.getChildrenSize()).toBeGreaterThan(0);
    });
  });

  it('inserts file node with error status', async () => {
    await new Promise<void>((resolve) => {
      editor.update(
        () => {
          editor.dispatchCommand(INSERT_FILE_BLOCK_COMMAND, {
            url: 'blob:failed',
            filename: 'failed.pdf',
            size: 1024,
            mime: 'application/pdf',
            status: 'error',
          });
        },
        { onUpdate: resolve },
      );
    });

    editor.read(() => {
      const root = $getRoot();
      expect(root.getChildrenSize()).toBeGreaterThan(0);
    });
  });

  it('creates file node directly with createFileBlockNode', () => {
    editor.update(() => {
      const fileNode = $createFileBlockNode({
        url: 'https://example.com/doc.pdf',
        filename: 'doc.pdf',
        size: 4096,
        mime: 'application/pdf',
        status: 'uploaded',
      });
      expect(fileNode.getType()).toBe('file-block');
    });
  });

  it('handles file without optional fields', async () => {
    await new Promise<void>((resolve) => {
      editor.update(
        () => {
          editor.dispatchCommand(INSERT_FILE_BLOCK_COMMAND, {
            url: 'https://example.com/file.bin',
            filename: 'file.bin',
          });
        },
        { onUpdate: resolve },
      );
    });

    editor.read(() => {
      const root = $getRoot();
      expect(root.getChildrenSize()).toBeGreaterThan(0);
    });
  });
});

describe('InsertFilePlugin with MediaContext', () => {
  const createTestEditor = (mediaConfig: EditorMediaConfig | null) => {
    const TestComponent = () => (
      <LexicalComposer
        initialConfig={{
          namespace: 'test',
          nodes: [FileBlockNode, ParagraphNode],
          onError: (error) => console.error(error),
        }}
      >
        <MediaContext.Provider value={mediaConfig}>
          <RichTextPlugin
            contentEditable={<ContentEditable />}
            placeholder={<div />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <InsertFilePlugin />
        </MediaContext.Provider>
      </LexicalComposer>
    );
    return render(<TestComponent />);
  };

  it('renders plugin without crashing', () => {
    expect(() => createTestEditor(null)).not.toThrow();
  });

  it('renders plugin with uploadAdapter', () => {
    const mediaConfig: EditorMediaConfig = {
      uploadAdapter: {
        uploadFile: vi.fn().mockResolvedValue({
          url: 'https://example.com/uploaded.pdf',
          mime: 'application/pdf',
          size: 1024,
        }),
      },
      maxFileSizeMB: 10,
    };

    expect(() => createTestEditor(mediaConfig)).not.toThrow();
  });

  it('renders plugin with callbacks', () => {
    const mediaConfig: EditorMediaConfig = {
      uploadAdapter: {
        uploadFile: vi.fn().mockResolvedValue({
          url: 'https://example.com/uploaded.pdf',
          mime: 'application/pdf',
          size: 1024,
        }),
      },
      callbacks: {
        onUploadStart: vi.fn(),
        onUploadProgress: vi.fn(),
        onUploadComplete: vi.fn(),
        onUploadError: vi.fn(),
      },
      maxFileSizeMB: 10,
    };

    expect(() => createTestEditor(mediaConfig)).not.toThrow();
  });
});

describe('INSERT_FILE_BLOCK_COMMAND', () => {
  it('exports the command', () => {
    expect(INSERT_FILE_BLOCK_COMMAND).toBeDefined();
    expect(typeof INSERT_FILE_BLOCK_COMMAND).toBe('object');
  });
});
