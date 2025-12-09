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
        'uploaded',
      );
      expect(node).toBeInstanceOf(FileBlockNode);
      expect(node.__url).toBe('https://example.com/file.pdf');
      expect(node.__filename).toBe('file.pdf');
      expect(node.__size).toBe(1024);
      expect(node.__mime).toBe('application/pdf');
      expect(node.__status).toBe('uploaded');
    });
  });

  test('should serialize and deserialize', () => {
    editor.update(() => {
      const node = new FileBlockNode(
        'https://example.com/file.pdf',
        'file.pdf',
        1024,
        'application/pdf',
        'uploaded',
      );
      const serialized = node.exportJSON();
      expect(serialized).toEqual({
        url: 'https://example.com/file.pdf',
        filename: 'file.pdf',
        size: 1024,
        mime: 'application/pdf',
        status: 'uploaded',
        type: 'file-block',
        version: 1,
      });

      const deserialized = FileBlockNode.importJSON(serialized);
      expect(deserialized).toBeInstanceOf(FileBlockNode);
      expect(deserialized.__url).toBe('https://example.com/file.pdf');
      expect(deserialized.__filename).toBe('file.pdf');
      expect(deserialized.__size).toBe(1024);
      expect(deserialized.__mime).toBe('application/pdf');
      expect(deserialized.__status).toBe('uploaded');
    });
  });

  test('should return correct type', () => {
    expect(FileBlockNode.getType()).toBe('file-block');
  });

  test('should clone node correctly', () => {
    editor.update(() => {
      const node = new FileBlockNode(
        'https://example.com/test.zip',
        'test.zip',
        2048,
        'application/zip',
        'uploading',
      );
      const cloned = FileBlockNode.clone(node);
      expect(cloned.__url).toBe('https://example.com/test.zip');
      expect(cloned.__filename).toBe('test.zip');
      expect(cloned.__size).toBe(2048);
      expect(cloned.__mime).toBe('application/zip');
      expect(cloned.__status).toBe('uploading');
    });
  });

  test('should handle error status', () => {
    editor.update(() => {
      const node = new FileBlockNode(
        'https://example.com/file.pdf',
        'file.pdf',
        1024,
        'application/pdf',
        'error',
      );
      expect(node.__status).toBe('error');
    });
  });

  test('should handle undefined optional fields', () => {
    editor.update(() => {
      const node = new FileBlockNode(
        'https://example.com/file.pdf',
        'file.pdf',
      );
      expect(node.__size).toBeUndefined();
      expect(node.__mime).toBeUndefined();
      expect(node.__status).toBeUndefined();
    });
  });
});
