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
      };

      const node = ImageBlockNode.importJSON(json);

      expect(node).toBeInstanceOf(ImageBlockNode);
      expect(node.__src).toBe(json.src);
      expect(node.__alt).toBe(json.alt);
      expect(node.__caption).toBe(json.caption);
      expect(node.__layout).toBe(json.layout);
      expect(node.__width).toBe(json.width);
      expect(node.__height).toBe(json.height);
    });
  });
});
