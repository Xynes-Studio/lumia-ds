import { describe, it, expect, vi } from 'vitest';
import {
  getEffectiveMediaConfig,
  DEFAULT_ALLOWED_IMAGE_TYPES,
  DEFAULT_ALLOWED_VIDEO_TYPES,
  DEFAULT_MAX_FILE_SIZE_MB,
  EditorMediaConfig,
  MediaUploadCallbacks,
  UploadOptions,
} from './media-config';

describe('getEffectiveMediaConfig', () => {
  it('should return defaults when no config is provided', () => {
    const config = getEffectiveMediaConfig();
    expect(config.allowedImageTypes).toEqual(DEFAULT_ALLOWED_IMAGE_TYPES);
    expect(config.allowedVideoTypes).toEqual(DEFAULT_ALLOWED_VIDEO_TYPES);
    expect(config.maxFileSizeMB).toEqual(DEFAULT_MAX_FILE_SIZE_MB);
    expect(config.uploadAdapter).toBeUndefined();
  });

  it('should return defaults when empty config object is provided', () => {
    const config = getEffectiveMediaConfig({});
    expect(config.allowedImageTypes).toEqual(DEFAULT_ALLOWED_IMAGE_TYPES);
    expect(config.allowedVideoTypes).toEqual(DEFAULT_ALLOWED_VIDEO_TYPES);
    expect(config.maxFileSizeMB).toEqual(DEFAULT_MAX_FILE_SIZE_MB);
    expect(config.uploadAdapter).toBeUndefined();
  });

  it('should override allowedImageTypes', () => {
    const customTypes = ['image/png'];
    const config = getEffectiveMediaConfig({ allowedImageTypes: customTypes });
    expect(config.allowedImageTypes).toEqual(customTypes);
    expect(config.allowedVideoTypes).toEqual(DEFAULT_ALLOWED_VIDEO_TYPES);
  });

  it('should override allowedVideoTypes', () => {
    const customTypes = ['video/mp4'];
    const config = getEffectiveMediaConfig({ allowedVideoTypes: customTypes });
    expect(config.allowedVideoTypes).toEqual(customTypes);
    expect(config.allowedImageTypes).toEqual(DEFAULT_ALLOWED_IMAGE_TYPES);
  });

  it('should override maxFileSizeMB', () => {
    const customSize = 10;
    const config = getEffectiveMediaConfig({ maxFileSizeMB: customSize });
    expect(config.maxFileSizeMB).toEqual(customSize);
  });

  it('should pass through uploadAdapter', () => {
    const mockAdapter = {
      uploadFile: async () => ({ url: '', mime: '', size: 0 }),
    };
    const config = getEffectiveMediaConfig({ uploadAdapter: mockAdapter });
    expect(config.uploadAdapter).toBe(mockAdapter);
  });

  it('should handle partial overrides correctly', () => {
    const customConfig: EditorMediaConfig = {
      allowedImageTypes: ['image/jpeg'],
      maxFileSizeMB: 20,
    };
    const config = getEffectiveMediaConfig(customConfig);
    expect(config.allowedImageTypes).toEqual(['image/jpeg']);
    expect(config.maxFileSizeMB).toEqual(20);
    expect(config.allowedVideoTypes).toEqual(DEFAULT_ALLOWED_VIDEO_TYPES);
    expect(config.uploadAdapter).toBeUndefined();
  });

  it('should pass through callbacks configuration', () => {
    const mockCallbacks: MediaUploadCallbacks = {
      onUploadStart: vi.fn(),
      onUploadProgress: vi.fn(),
      onUploadComplete: vi.fn(),
      onUploadError: vi.fn(),
    };

    const config = getEffectiveMediaConfig({ callbacks: mockCallbacks });
    expect(config.callbacks).toBe(mockCallbacks);
  });

  it('should preserve all callback types', () => {
    const onUploadStart = vi.fn();
    const onUploadProgress = vi.fn();
    const onUploadComplete = vi.fn();
    const onUploadError = vi.fn();

    const config = getEffectiveMediaConfig({
      callbacks: {
        onUploadStart,
        onUploadProgress,
        onUploadComplete,
        onUploadError,
      },
    });

    expect(config.callbacks?.onUploadStart).toBe(onUploadStart);
    expect(config.callbacks?.onUploadProgress).toBe(onUploadProgress);
    expect(config.callbacks?.onUploadComplete).toBe(onUploadComplete);
    expect(config.callbacks?.onUploadError).toBe(onUploadError);
  });
});

describe('MediaUploadAdapter', () => {
  it('should support uploadFile with options parameter', async () => {
    const onProgress = vi.fn();
    const mockAdapter = {
      uploadFile: async (file: File, options?: UploadOptions) => {
        // Simulate progress updates
        options?.onProgress?.(25);
        options?.onProgress?.(50);
        options?.onProgress?.(75);
        options?.onProgress?.(100);
        return {
          url: 'https://example.com/file.jpg',
          mime: file.type,
          size: file.size,
        };
      },
    };

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const result = await mockAdapter.uploadFile(file, { onProgress });

    expect(result.url).toBe('https://example.com/file.jpg');
    expect(result.mime).toBe('image/jpeg');
    expect(onProgress).toHaveBeenCalledTimes(4);
    expect(onProgress).toHaveBeenCalledWith(25);
    expect(onProgress).toHaveBeenCalledWith(50);
    expect(onProgress).toHaveBeenCalledWith(75);
    expect(onProgress).toHaveBeenCalledWith(100);
  });

  it('should work without options (backward compatible)', async () => {
    const mockAdapter = {
      uploadFile: async (file: File) => {
        return {
          url: 'https://example.com/file.jpg',
          mime: file.type,
          size: file.size,
        };
      },
    };

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const result = await mockAdapter.uploadFile(file);

    expect(result.url).toBe('https://example.com/file.jpg');
  });

  it('should handle upload errors', async () => {
    const mockAdapter = {
      uploadFile: async () => {
        throw new Error('Network error');
      },
    };

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    await expect(mockAdapter.uploadFile(file)).rejects.toThrow('Network error');
  });

  // ─── STORAGE-11: objectId + resolveDownloadUrl ─────────────────────────

  it('STORAGE-11: uploadFile result accepts optional objectId', async () => {
    const mockAdapter = {
      uploadFile: async (file: File) => {
        return {
          url: 'https://signed.example/file.jpg',
          mime: file.type,
          size: file.size,
          objectId: 'obj_storage_11_test',
        };
      },
    };
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const result = await mockAdapter.uploadFile(file);
    expect(result.objectId).toBe('obj_storage_11_test');
  });

  it('STORAGE-11: uploadFile result without objectId stays backward-compatible', async () => {
    const mockAdapter = {
      uploadFile: async (file: File) => ({
        url: 'https://example.com/legacy.jpg',
        mime: file.type,
        size: file.size,
      }),
    };
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const result = await mockAdapter.uploadFile(file);
    expect(result.url).toBe('https://example.com/legacy.jpg');
    expect((result as { objectId?: string }).objectId).toBeUndefined();
  });
});

describe('STORAGE-11 resolveDownloadUrl', () => {
  it('getEffectiveMediaConfig passes through resolveDownloadUrl', () => {
    const resolver = vi.fn(async () => 'https://signed.example/url');
    const config = getEffectiveMediaConfig({ resolveDownloadUrl: resolver });
    expect(config.resolveDownloadUrl).toBe(resolver);
  });

  it('getEffectiveMediaConfig leaves resolveDownloadUrl undefined by default', () => {
    const config = getEffectiveMediaConfig();
    expect(config.resolveDownloadUrl).toBeUndefined();
  });

  it('resolver receives an objectId and returns a signed URL', async () => {
    const resolver = vi.fn(
      async (objectId: string) => `https://signed.example/${objectId}`,
    );
    const url = await resolver('obj_abc');
    expect(url).toBe('https://signed.example/obj_abc');
    expect(resolver).toHaveBeenCalledWith('obj_abc');
  });
});
