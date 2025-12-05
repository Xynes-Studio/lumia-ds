import { describe, it, expect } from 'vitest';
import {
  getEffectiveMediaConfig,
  DEFAULT_ALLOWED_IMAGE_TYPES,
  DEFAULT_ALLOWED_VIDEO_TYPES,
  DEFAULT_MAX_FILE_SIZE_MB,
  EditorMediaConfig,
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
});
