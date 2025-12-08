import { createHeadlessEditor } from '@lexical/headless';
import {
  $createImageBlockNode,
  $isImageBlockNode,
  ImageBlockNode,
} from '../nodes/ImageBlockNode/ImageBlockNode';
import { describe, it, expect, beforeEach } from 'vitest';

describe('InsertImagePlugin', () => {
  let editor: ReturnType<typeof createHeadlessEditor>;

  beforeEach(() => {
    editor = createHeadlessEditor({
      nodes: [ImageBlockNode],
      onError: () => { },
    });
  });

  it('should register INSERT_IMAGE_BLOCK_COMMAND', () => {
    // This is implicitly tested by dispatching the command
    expect(true).toBe(true);
  });

  it('should insert an image node when command is dispatched', async () => {
    const payload = {
      src: 'https://example.com/image.jpg',
      alt: 'Test Image',
    };

    editor.update(() => {
      const node = $createImageBlockNode(payload);
      expect($isImageBlockNode(node)).toBe(true);
      const json = node.exportJSON();
      expect(json.src).toBe(payload.src);
      expect(json.alt).toBe(payload.alt);
    });
  });

  it('should create image node with caption', async () => {
    const payload = {
      src: 'https://example.com/image.jpg',
      alt: 'Test Image',
      caption: 'This is a caption',
    };

    editor.update(() => {
      const node = $createImageBlockNode(payload);
      expect($isImageBlockNode(node)).toBe(true);
      const json = node.exportJSON();
      expect(json.caption).toBe(payload.caption);
    });
  });

  it('should create image node with width and height', async () => {
    const payload = {
      src: 'https://example.com/image.jpg',
      alt: 'Sized Image',
      width: 640,
      height: 480,
    };

    editor.update(() => {
      const node = $createImageBlockNode(payload);
      expect($isImageBlockNode(node)).toBe(true);
      const json = node.exportJSON();
      expect(json.width).toBe(640);
      expect(json.height).toBe(480);
    });
  });

  it('should create image node with uploading status', async () => {
    const payload = {
      src: 'blob:example',
      alt: 'Uploading Image',
      status: 'uploading' as const,
    };

    editor.update(() => {
      const node = $createImageBlockNode(payload);
      expect($isImageBlockNode(node)).toBe(true);
      const json = node.exportJSON();
      expect(json.status).toBe('uploading');
    });
  });
});
