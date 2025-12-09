import { $createVideoBlockNode, VideoBlockNode } from './VideoBlockNode';
import { createHeadlessEditor } from '@lexical/headless';
import { describe, test, expect } from 'vitest';

describe('VideoBlockNode', () => {
  const editor = createHeadlessEditor({
    nodes: [VideoBlockNode],
  });

  test('should create a video block node', () => {
    editor.update(() => {
      const node = $createVideoBlockNode({
        src: 'https://example.com/video.mp4',
        provider: 'html5',
        title: 'Example Video',
        width: 500,
        height: 300,
        layout: 'inline',
        alignment: 'center',
      });

      expect(node).toBeInstanceOf(VideoBlockNode);
      expect(node.__src).toBe('https://example.com/video.mp4');
      expect(node.__provider).toBe('html5');
      expect(node.__title).toBe('Example Video');
      expect(node.__width).toBe(500);
      expect(node.__height).toBe(300);
      expect(node.__layout).toBe('inline');
      expect(node.__alignment).toBe('center');
    });
  });

  test('should export and import JSON', () => {
    editor.update(() => {
      const node = $createVideoBlockNode({
        src: 'https://example.com/video.mp4',
        provider: 'html5',
        title: 'Example Video',
        width: 500,
        height: 300,
        layout: 'inline',
        alignment: 'center',
      });

      const json = node.exportJSON();
      expect(json).toEqual({
        src: 'https://example.com/video.mp4',
        provider: 'html5',
        title: 'Example Video',
        width: 500,
        height: 300,
        layout: 'inline',
        alignment: 'center',
        type: 'video-block',
        version: 1,
      });

      const importedNode = VideoBlockNode.importJSON(json);
      expect(importedNode).toBeInstanceOf(VideoBlockNode);
      expect(importedNode.__src).toBe('https://example.com/video.mp4');
      expect(importedNode.__provider).toBe('html5');
      expect(importedNode.__title).toBe('Example Video');
      expect(importedNode.__width).toBe(500);
      expect(importedNode.__height).toBe(300);
      expect(importedNode.__layout).toBe('inline');
      expect(importedNode.__alignment).toBe('center');
    });
  });

  test('should clone correctly', () => {
    editor.update(() => {
      const node = $createVideoBlockNode({
        src: 'https://example.com/video.mp4',
        provider: 'html5',
        title: 'Example Video',
        width: 500,
        height: 300,
        layout: 'inline',
        alignment: 'center',
      });

      const clonedNode = VideoBlockNode.clone(node);
      expect(clonedNode).toBeInstanceOf(VideoBlockNode);
      expect(clonedNode).not.toBe(node);
      expect(clonedNode.__src).toBe(node.__src);
      expect(clonedNode.__provider).toBe(node.__provider);
      expect(clonedNode.__title).toBe(node.__title);
      expect(clonedNode.__width).toBe(node.__width);
      expect(clonedNode.__height).toBe(node.__height);
      expect(clonedNode.__layout).toBe(node.__layout);
      expect(clonedNode.__alignment).toBe(node.__alignment);
    });
  });

  test('should return correct type', () => {
    expect(VideoBlockNode.getType()).toBe('video-block');
  });

  test('should handle upload status', () => {
    editor.update(() => {
      const node = $createVideoBlockNode({
        src: 'blob:test',
        provider: 'html5',
        status: 'uploading',
      });

      expect(node.__status).toBe('uploading');
    });
  });

  test('should handle error status', () => {
    editor.update(() => {
      const node = $createVideoBlockNode({
        src: 'blob:test',
        provider: 'html5',
        status: 'error',
      });

      expect(node.__status).toBe('error');
    });
  });

  test('should support width setter', () => {
    editor.update(() => {
      const node = $createVideoBlockNode({
        src: 'https://example.com/video.mp4',
        provider: 'html5',
      });

      node.setWidth(800);
      expect(node.__width).toBe(800);
    });
  });

  test('should support alignment setter', () => {
    editor.update(() => {
      const node = $createVideoBlockNode({
        src: 'https://example.com/video.mp4',
        provider: 'html5',
      });

      node.setAlignment('right');
      expect(node.__alignment).toBe('right');
    });
  });

  test('should create node with youtube provider', () => {
    editor.update(() => {
      const node = $createVideoBlockNode({
        src: 'https://youtube.com/watch?v=abc123',
        provider: 'youtube',
        title: 'YouTube Video',
      });

      expect(node.__src).toBe('https://youtube.com/watch?v=abc123');
      expect(node.__provider).toBe('youtube');
    });
  });
});
