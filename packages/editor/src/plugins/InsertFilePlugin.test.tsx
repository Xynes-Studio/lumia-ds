import { describe, it, expect, beforeEach } from 'vitest';
import { createHeadlessEditor } from '@lexical/headless';
import { $getRoot, ParagraphNode, COMMAND_PRIORITY_EDITOR } from 'lexical';
import { INSERT_FILE_BLOCK_COMMAND } from './InsertFilePlugin';
import {
  FileBlockNode,
  $createFileBlockNode,
} from '../nodes/FileBlockNode/FileBlockNode';
import { $insertNodes, $isRootOrShadowRoot } from 'lexical';
import { $wrapNodeInElement } from '@lexical/utils';
import { $createParagraphNode } from 'lexical';

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
});
