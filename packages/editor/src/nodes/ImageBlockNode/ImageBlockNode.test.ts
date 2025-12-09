import { ImageBlockNode } from './ImageBlockNode';
import { createHeadlessEditor } from '@lexical/headless';
import { describe, test, expect } from 'vitest';

describe('ImageBlockNode', () => {
  const editor = createHeadlessEditor({
    nodes: [ImageBlockNode],
  });

  test('exportJSON should return correct JSON object', () => {
    editor.update(() => {
      const node = new ImageBlockNode(
        'https://example.com/image.jpg',
        'Example Image',
        'A caption',
        'fullWidth',
        800,
        600,
        'uploaded',
      );
      const json = node.exportJSON();

      expect(json).toEqual({
        type: 'image-block',
        version: 1,
        src: 'https://example.com/image.jpg',
        alt: 'Example Image',
        caption: 'A caption',
        layout: 'fullWidth',
        width: 800,
        height: 600,
        status: 'uploaded',
      });
    });
  });

  test('importJSON should create a node from JSON object', () => {
    editor.update(() => {
      const json = {
        type: 'image-block',
        version: 1,
        src: 'https://example.com/image.jpg',
        alt: 'Example Image',
        caption: 'A caption',
        layout: 'fullWidth' as const,
        width: 800,
        height: 600,
        status: 'uploading' as const,
      };

      const node = ImageBlockNode.importJSON(json);

      expect(node).toBeInstanceOf(ImageBlockNode);
      expect(node.__src).toBe(json.src);
      expect(node.__alt).toBe(json.alt);
      expect(node.__caption).toBe(json.caption);
      expect(node.__layout).toBe(json.layout);
      expect(node.__width).toBe(json.width);
      expect(node.__height).toBe(json.height);
      expect(node.__status).toBe(json.status);
    });
  });

  test('should return correct type', () => {
    expect(ImageBlockNode.getType()).toBe('image-block');
  });

  test('should clone correctly', () => {
    editor.update(() => {
      const node = new ImageBlockNode(
        'https://example.com/image.jpg',
        'Test',
        'Caption',
        'inline',
        400,
        300,
        'uploaded',
      );
      const cloned = ImageBlockNode.clone(node);
      expect(cloned.__src).toBe(node.__src);
      expect(cloned.__alt).toBe(node.__alt);
      expect(cloned.__layout).toBe(node.__layout);
    });
  });

  test('should handle error status', () => {
    editor.update(() => {
      const node = new ImageBlockNode(
        'blob:test',
        'Error Image',
        undefined,
        'inline',
        undefined,
        undefined,
        'error',
      );
      expect(node.__status).toBe('error');
    });
  });

  test('should support setWidth', () => {
    editor.update(() => {
      const node = new ImageBlockNode('https://example.com/test.jpg', 'Test');
      node.setWidth(640);
      expect(node.__width).toBe(640);
    });
  });

  test('should support setLayout', () => {
    editor.update(() => {
      const node = new ImageBlockNode('https://example.com/test.jpg', 'Test');
      node.setLayout('fullWidth');
      expect(node.__layout).toBe('fullWidth');
    });
  });

  test('should support setCaption', () => {
    editor.update(() => {
      const node = new ImageBlockNode('https://example.com/test.jpg', 'Test');
      node.setCaption('New caption');
      expect(node.__caption).toBe('New caption');
    });
  });
});
