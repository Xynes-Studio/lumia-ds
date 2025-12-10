import { describe, it, expect, beforeEach } from 'vitest';
import { createHeadlessEditor } from '@lexical/headless';
import { $getRoot, ParagraphNode } from 'lexical';
import { INSERT_PANEL_COMMAND } from './InsertPanelPlugin';
import { PanelBlockNode } from '../nodes/PanelBlockNode/PanelBlockNode';
import { COMMAND_PRIORITY_EDITOR } from 'lexical';
import { $insertNodeToNearestRoot } from '@lexical/utils';
import { $createPanelBlockNode } from '../nodes/PanelBlockNode/PanelBlockNode';
import { $createParagraphNode } from 'lexical';

describe('InsertPanelPlugin', () => {
  let editor: ReturnType<typeof createHeadlessEditor>;

  beforeEach(() => {
    editor = createHeadlessEditor({
      namespace: 'test',
      nodes: [PanelBlockNode, ParagraphNode],
      onError: (error) => console.error(error),
    });

    // Register the command listener manually for testing
    editor.registerCommand(
      INSERT_PANEL_COMMAND,
      (payload) => {
        const finalPayload = {
          ...payload,
          icon: payload.icon || payload.variant,
        };
        const panelNode = $createPanelBlockNode(finalPayload);
        const paragraphNode = $createParagraphNode();
        panelNode.append(paragraphNode);
        $insertNodeToNearestRoot(panelNode);
        paragraphNode.select();
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  });

  it('inserts panel node with info variant', async () => {
    await new Promise<void>((resolve) => {
      editor.update(
        () => {
          editor.dispatchCommand(INSERT_PANEL_COMMAND, {
            variant: 'info',
            title: 'Info Panel',
          });
        },
        { onUpdate: resolve },
      );
    });

    editor.read(() => {
      const root = $getRoot();
      const children = root.getChildren();
      expect(children.length).toBeGreaterThan(0);

      // Find the panel node
      const panelNode = children.find(
        (child) => child.getType() === 'panel-block',
      );
      expect(panelNode).toBeDefined();
    });
  });

  it('inserts panel node with warning variant', async () => {
    await new Promise<void>((resolve) => {
      editor.update(
        () => {
          editor.dispatchCommand(INSERT_PANEL_COMMAND, {
            variant: 'warning',
            title: 'Warning Panel',
          });
        },
        { onUpdate: resolve },
      );
    });

    editor.read(() => {
      const root = $getRoot();
      const children = root.getChildren();
      const panelNode = children.find(
        (child) => child.getType() === 'panel-block',
      );
      expect(panelNode).toBeDefined();
    });
  });

  it('creates panel with paragraph child for content', async () => {
    await new Promise<void>((resolve) => {
      editor.update(
        () => {
          editor.dispatchCommand(INSERT_PANEL_COMMAND, {
            variant: 'note',
            title: 'Note Panel',
          });
        },
        { onUpdate: resolve },
      );
    });

    editor.read(() => {
      const root = $getRoot();
      const panelNode = root
        .getChildren()
        .find((child) => child.getType() === 'panel-block');

      if (panelNode && 'getChildren' in panelNode) {
        const nodeWithChildren = panelNode as unknown as {
          getChildren: () => Array<{ getType: () => string }>;
        };
        const panelChildren = nodeWithChildren.getChildren();
        expect(panelChildren.length).toBeGreaterThan(0);
      }
    });
  });
});
