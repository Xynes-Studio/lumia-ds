import { StatusNode } from './StatusNode';
import { createHeadlessEditor } from '@lexical/headless';
import { describe, test, expect } from 'vitest';

describe('StatusNode', () => {
  const editor = createHeadlessEditor({
    nodes: [StatusNode],
  });

  test('should create a StatusNode', () => {
    editor.update(() => {
      const node = new StatusNode('In Progress', 'info');
      expect(node).toBeInstanceOf(StatusNode);
      expect(node.__text).toBe('In Progress');
      expect(node.__color).toBe('info');
    });
  });

  test('should be inline', () => {
    editor.update(() => {
      const node = new StatusNode('Done', 'success');
      expect(node.isInline()).toBe(true);
    });
  });

  test('should serialize and deserialize', () => {
    editor.update(() => {
      const node = new StatusNode('Blocked', 'error');
      const serialized = node.exportJSON();
      expect(serialized).toEqual({
        text: 'Blocked',
        color: 'error',
        type: 'status',
        version: 1,
      });

      const deserialized = StatusNode.importJSON(serialized);
      expect(deserialized).toBeInstanceOf(StatusNode);
      expect(deserialized.__text).toBe('Blocked');
      expect(deserialized.__color).toBe('error');
    });
  });

  test('should roundtrip JSON correctly', () => {
    editor.update(() => {
      const original = new StatusNode('Review', 'warning');
      const json = original.exportJSON();
      const restored = StatusNode.importJSON(json);

      expect(restored.__text).toBe(original.__text);
      expect(restored.__color).toBe(original.__color);
      expect(StatusNode.getType()).toBe(StatusNode.getType());
    });
  });

  test('setText should update the text', () => {
    editor.update(() => {
      const node = new StatusNode('Original', 'info');
      node.setText('Updated');
      expect(node.__text).toBe('Updated');
    });
  });

  test('setColor should update the color', () => {
    editor.update(() => {
      const node = new StatusNode('Status', 'info');
      node.setColor('success');
      expect(node.__color).toBe('success');
    });
  });

  test('getText and getColor accessors work correctly', () => {
    editor.update(() => {
      const node = new StatusNode('Test', 'warning');
      expect(node.getText()).toBe('Test');
      expect(node.getColor()).toBe('warning');
    });
  });
});
