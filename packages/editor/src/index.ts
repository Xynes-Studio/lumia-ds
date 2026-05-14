export * from './lumia-editor';
export * from './EditorProvider';
export * from './useEditorState';
export * from './LumiaInlineEditor';
export * from './types';
export * from './font-config';
export * from './useFontsConfig';
export * from './components/Fonts';
export * from './blocks';
export * from './components/BlockInspector/BlockInspector';
export * from './components/BlockOutline';
// STORAGE-11: re-export media-config types so consumers can type their
// upload adapter and download-URL resolver implementations.
export type {
  EditorMediaConfig,
  MediaUploadAdapter,
  MediaUploadCallbacks,
  MediaUploadResult,
  UploadOptions,
} from './media-config';
export {
  DEFAULT_ALLOWED_IMAGE_TYPES,
  DEFAULT_ALLOWED_VIDEO_TYPES,
  DEFAULT_MAX_FILE_SIZE_MB,
} from './media-config';
// STORAGE-11: re-export ImageBlock types/helpers so consumers can walk the
// editor body to find storage-backed images and strip transient signed URLs
// before persisting the entry body.
export type {
  ImageBlockPayload,
  SerializedImageBlockNode,
  ImageBlockAlignment,
} from './nodes/ImageBlockNode/ImageBlockNode';
export {
  ImageBlockNode,
  $createImageBlockNode,
  $isImageBlockNode,
} from './nodes/ImageBlockNode/ImageBlockNode';
