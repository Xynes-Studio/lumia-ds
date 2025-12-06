import { describe, test, expect } from 'vitest';
import { $createPanelBlockNode, PanelBlockNode } from './PanelBlockNode'; // Adjust import based on your setup
import { createHeadlessEditor } from '@lexical/headless';

describe('PanelBlockNode', () => {
  const editorConfig = {
    namespace: 'test',
    nodes: [PanelBlockNode],
    onError: (error: Error) => {
      throw error;
    },
    theme: {
      panel: 'panel-node',
    },
  };

  test('should create a panel node', () => {
    const editor = createHeadlessEditor(editorConfig);
    editor.update(() => {
      const node = $createPanelBlockNode({ variant: 'info', title: 'Info' });
      expect(node).toBeInstanceOf(PanelBlockNode);
      expect(node.__variant).toBe('info');
      expect(node.__title).toBe('Info');
    });
  });

  test('should handle variants', () => {
    const editor = createHeadlessEditor(editorConfig);
    editor.update(() => {
      const node = $createPanelBlockNode({ variant: 'warning' });
      expect(node.__variant).toBe('warning');
    });
  });

  test('should export and import JSON', () => {
    const editor = createHeadlessEditor(editorConfig);
    editor.update(() => {
      const node = $createPanelBlockNode({
        variant: 'success',
        title: 'Success!',
        icon: 'check',
      });
      const json = node.exportJSON();
      expect(json).toEqual(
        expect.objectContaining({
          type: 'panel-block',
          variant: 'success',
          title: 'Success!',
          icon: 'check',
          version: 1,
        }),
      );

      const importedNode = PanelBlockNode.importJSON(json);
      expect(importedNode).toBeInstanceOf(PanelBlockNode);
      expect(importedNode.__variant).toBe('success');
      expect(importedNode.__title).toBe('Success!');
      expect(importedNode.__icon).toBe('check');
    });
  });
});
