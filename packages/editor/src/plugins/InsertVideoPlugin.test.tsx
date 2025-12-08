import { createHeadlessEditor } from '@lexical/headless';
import {
  $createVideoBlockNode,
  $isVideoBlockNode,
  VideoBlockNode,
} from '../nodes/VideoBlockNode';
import { describe, it, expect, beforeEach } from 'vitest';
import { detectVideoProvider } from './InsertVideoPlugin';

describe('InsertVideoPlugin', () => {
  let editor: ReturnType<typeof createHeadlessEditor>;

  beforeEach(() => {
    editor = createHeadlessEditor({
      nodes: [VideoBlockNode],
      onError: () => { },
    });
  });

  describe('detectVideoProvider', () => {
    it('should detect YouTube URLs', () => {
      expect(
        detectVideoProvider('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
      ).toBe('youtube');
      expect(detectVideoProvider('https://youtu.be/dQw4w9WgXcQ')).toBe(
        'youtube',
      );
      expect(
        detectVideoProvider('https://www.youtube.com/embed/dQw4w9WgXcQ'),
      ).toBe('youtube');
    });

    it('should detect Vimeo URLs', () => {
      expect(detectVideoProvider('https://vimeo.com/123456789')).toBe('vimeo');
      expect(
        detectVideoProvider('https://player.vimeo.com/video/123456789'),
      ).toBe('vimeo');
    });

    it('should detect Loom URLs', () => {
      expect(
        detectVideoProvider('https://www.loom.com/share/abc123def456'),
      ).toBe('loom');
      expect(detectVideoProvider('https://loom.com/embed/abc123def456')).toBe(
        'loom',
      );
    });

    it('should detect HTML5 video URLs', () => {
      expect(detectVideoProvider('https://example.com/video.mp4')).toBe(
        'html5',
      );
      expect(detectVideoProvider('https://example.com/video.webm')).toBe(
        'html5',
      );
      expect(detectVideoProvider('https://example.com/video.ogg')).toBe(
        'html5',
      );
    });

    it('should return undefined for unknown URLs', () => {
      expect(detectVideoProvider('https://example.com/page')).toBeUndefined();
      expect(
        detectVideoProvider('https://example.com/random-page.html'),
      ).toBeUndefined();
      expect(
        detectVideoProvider('https://google.com/search?q=test'),
      ).toBeUndefined();
    });
  });

  describe('VideoBlockNode creation', () => {
    it('should create a video node with correct attributes', () => {
      const payload = {
        src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        provider: 'youtube' as const,
        title: 'Test Video',
      };

      editor.update(() => {
        const node = $createVideoBlockNode(payload);
        expect($isVideoBlockNode(node)).toBe(true);
        const json = node.exportJSON();
        expect(json.src).toBe(payload.src);
        expect(json.provider).toBe(payload.provider);
        expect(json.title).toBe(payload.title);
      });
    });

    it('should create a video node without optional fields', () => {
      const payload = {
        src: 'https://example.com/video.mp4',
      };

      editor.update(() => {
        const node = $createVideoBlockNode(payload);
        expect($isVideoBlockNode(node)).toBe(true);
        const json = node.exportJSON();
        expect(json.src).toBe(payload.src);
        expect(json.provider).toBeUndefined();
        expect(json.title).toBeUndefined();
      });
    });
  });

  describe('Command payload validation', () => {
    it('should accept payload with all fields', () => {
      const payload = {
        src: 'https://vimeo.com/123456789',
        provider: 'vimeo' as const,
        title: 'My Vimeo Video',
      };

      editor.update(() => {
        const node = $createVideoBlockNode(payload);
        expect(node.getSrc()).toBe(payload.src);
        expect(node.getProvider()).toBe(payload.provider);
        expect(node.getTitle()).toBe(payload.title);
      });
    });

    it('should accept payload with only src', () => {
      const payload = {
        src: 'https://loom.com/share/abc123',
      };

      editor.update(() => {
        const node = $createVideoBlockNode(payload);
        expect(node.getSrc()).toBe(payload.src);
        expect(node.getProvider()).toBeUndefined();
        expect(node.getTitle()).toBeUndefined();
      });
    });

    it('should detect html5 video from mov extension', () => {
      expect(detectVideoProvider('https://example.com/video.mov')).toBe(
        'html5',
      );
    });

    it('should handle URL with query params', () => {
      expect(
        detectVideoProvider('https://example.com/video.mp4?token=abc'),
      ).toBe('html5');
    });

    it('should trim whitespace from URLs', () => {
      expect(
        detectVideoProvider('  https://www.youtube.com/watch?v=test  '),
      ).toBe('youtube');
    });
  });
});
