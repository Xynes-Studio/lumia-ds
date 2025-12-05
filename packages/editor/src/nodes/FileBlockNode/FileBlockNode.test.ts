import { FileBlockNode } from './FileBlockNode';
import { createHeadlessEditor } from '@lexical/headless';
import { describe, test, expect } from 'vitest';

describe('FileBlockNode', () => {
  const editor = createHeadlessEditor({
    nodes: [FileBlockNode],
  });

  test('should create a FileBlockNode', () => {
    editor.update(() => {
      const node = new FileBlockNode(
        'https://example.com/file.pdf',
        'file.pdf',
        1024,
        'application/pdf',
      );
      expect(node).toBeInstanceOf(FileBlockNode);
      expect(node.__url).toBe('https://example.com/file.pdf');
      expect(node.__filename).toBe('file.pdf');
      expect(node.__size).toBe(1024);
      expect(node.__mime).toBe('application/pdf');
    });
  });

  test('should serialize and deserialize', () => {
    editor.update(() => {
      const node = new FileBlockNode(
        'https://example.com/file.pdf',
        'file.pdf',
        1024,
        'application/pdf',
      );
      const serialized = node.exportJSON();
      expect(serialized).toEqual({
        url: 'https://example.com/file.pdf',
        filename: 'file.pdf',
        size: 1024,
        mime: 'application/pdf',
        type: 'file-block',
        version: 1,
      });

      const deserialized = FileBlockNode.importJSON(serialized);
      expect(deserialized).toBeInstanceOf(FileBlockNode);
      expect(deserialized.__url).toBe('https://example.com/file.pdf');
      expect(deserialized.__filename).toBe('file.pdf');
      expect(deserialized.__size).toBe(1024);
      expect(deserialized.__mime).toBe('application/pdf');
    });
  });
});
