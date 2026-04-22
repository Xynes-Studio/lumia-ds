import { describe, test, expect } from 'vitest';
import { $createPanelBlockNode, PanelBlockNode } from './PanelBlockNode'; // Adjust import based on your setup
import { createHeadlessEditor } from '@lexical/headless';
import { $createTextNode, $createParagraphNode, $getRoot } from 'lexical';

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

  test('should update variant and icon via setters', () => {
    const editor = createHeadlessEditor(editorConfig);
    editor.update(() => {
      const node = $createPanelBlockNode({ variant: 'info' });
      expect(node.getVariant()).toBe('info');

      node.setVariant('warning');
      expect(node.getVariant()).toBe('warning');
      expect(node.__variant).toBe('warning');

      node.setIcon('alert-triangle');
      expect(node.getIcon()).toBe('alert-triangle');

      node.setTitle('New Title');
      expect(node.getTitle()).toBe('New Title');
    });
  });

  test('should create node from command payload', () => {
    const editor = createHeadlessEditor(editorConfig);
    editor.update(() => {
      // Simulate payload from /panel command
      const payload = {
        variant: 'info' as const,
        title: 'Info Panel',
      };
      const node = $createPanelBlockNode(payload);
      expect(node.getVariant()).toBe('info');
      expect(node.getTitle()).toBe('Info Panel');
    });
  });

  test('should clone node correctly', () => {
    const editor = createHeadlessEditor(editorConfig);
    editor.update(() => {
      const node = $createPanelBlockNode({
        variant: 'success',
        title: 'Clone Test',
        icon: 'check',
      });
      const cloned = PanelBlockNode.clone(node);
      expect(cloned.__variant).toBe('success');
      expect(cloned.__title).toBe('Clone Test');
      expect(cloned.__icon).toBe('check');
    });
  });

  test('should return correct type', () => {
    expect(PanelBlockNode.getType()).toBe('panel-block');
  });

  test('should default to info variant', () => {
    const editor = createHeadlessEditor(editorConfig);
    editor.update(() => {
      const node = $createPanelBlockNode({});
      expect(node.getVariant()).toBe('info');
    });
  });

  test('should handle undefined icon and title', () => {
    const editor = createHeadlessEditor(editorConfig);
    editor.update(() => {
      const node = $createPanelBlockNode({ variant: 'note' });
      expect(node.getIcon()).toBeUndefined();
      expect(node.getTitle()).toBeUndefined();
    });
  });

  test('should build DOM with icon and optional title', () => {
    const editor = createHeadlessEditor(editorConfig);
    editor.update(() => {
      const node = $createPanelBlockNode({
        variant: 'warning',
        title: 'Heads up',
        icon: 'alert',
      });
      const dom = node.createDOM(editorConfig as never);

      expect(dom.className).toContain('panel-node');
      expect(dom.className).toContain('warning');
      expect(
        (dom.querySelector('.panel-icon') as HTMLElement | null)?.dataset.icon,
      ).toBe('alert');
      expect(dom.querySelector('.panel-title')?.textContent).toBe('Heads up');
    });
  });

  test('should update DOM classes, icon data, and force rerender when title changes', () => {
    const editor = createHeadlessEditor(editorConfig);
    editor.update(() => {
      const previous = $createPanelBlockNode({ variant: 'info', title: 'Old' });
      const current = $createPanelBlockNode({
        variant: 'success',
        title: 'New',
        icon: 'check',
      });
      const dom = previous.createDOM(editorConfig as never);
      const shouldRerender = current.updateDOM(previous, dom);

      expect(dom.classList.contains('success')).toBe(true);
      expect(
        (dom.querySelector('.panel-icon') as HTMLElement | null)?.dataset.icon,
      ).toBe('check');
      expect(shouldRerender).toBe(true);
    });
  });

  test('insertNewAfter returns a paragraph at the end and null otherwise', () => {
    const editor = createHeadlessEditor(editorConfig);
    editor.update(() => {
      const root = $getRoot();
      const node = $createPanelBlockNode({ variant: 'info' });
      const paragraph = $createParagraphNode();
      const text = $createTextNode('Hello');
      paragraph.append(text);
      node.append(paragraph);
      root.append(node);

      const endSelection = {
        anchor: { key: text.getKey(), offset: text.getTextContentSize() },
      } as never;
      const result = node.insertNewAfter(endSelection);
      expect(result).not.toBeNull();

      const middleSelection = {
        anchor: { key: text.getKey(), offset: 1 },
      } as never;
      expect(node.insertNewAfter(middleSelection)).toBeNull();
    });
  });

  test('collapseAtStart converts an empty panel to a paragraph but leaves non-empty panels alone', () => {
    const editor = createHeadlessEditor(editorConfig);
    editor.update(() => {
      const root = $getRoot();
      const emptyNode = $createPanelBlockNode({ variant: 'info' });
      root.append(emptyNode);
      expect(emptyNode.collapseAtStart()).toBe(true);

      const node = $createPanelBlockNode({ variant: 'info' });
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode('Content'));
      node.append(paragraph);
      root.append(node);
      expect(node.collapseAtStart()).toBe(false);
    });
  });
});
