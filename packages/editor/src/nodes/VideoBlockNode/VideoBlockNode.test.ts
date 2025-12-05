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
      });

      expect(node).toBeInstanceOf(VideoBlockNode);
      expect(node.__src).toBe('https://example.com/video.mp4');
      expect(node.__provider).toBe('html5');
      expect(node.__title).toBe('Example Video');
    });
  });

  test('should export and import JSON', () => {
    editor.update(() => {
      const node = $createVideoBlockNode({
        src: 'https://example.com/video.mp4',
        provider: 'html5',
        title: 'Example Video',
      });

      const json = node.exportJSON();
      expect(json).toEqual({
        src: 'https://example.com/video.mp4',
        provider: 'html5',
        title: 'Example Video',
        type: 'video-block',
        version: 1,
      });

      const importedNode = VideoBlockNode.importJSON(json);
      expect(importedNode).toBeInstanceOf(VideoBlockNode);
      expect(importedNode.__src).toBe('https://example.com/video.mp4');
      expect(importedNode.__provider).toBe('html5');
      expect(importedNode.__title).toBe('Example Video');
    });
  });

  test('should clone correctly', () => {
    editor.update(() => {
      const node = $createVideoBlockNode({
        src: 'https://example.com/video.mp4',
        provider: 'html5',
        title: 'Example Video',
      });

      const clonedNode = VideoBlockNode.clone(node);
      expect(clonedNode).toBeInstanceOf(VideoBlockNode);
      expect(clonedNode).not.toBe(node);
      expect(clonedNode.__src).toBe(node.__src);
      expect(clonedNode.__provider).toBe(node.__provider);
      expect(clonedNode.__title).toBe(node.__title);
    });
  });
});
