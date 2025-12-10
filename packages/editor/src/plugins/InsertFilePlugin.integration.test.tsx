/**
 * Integration tests for InsertFilePlugin.
 * These tests use real Lexical editor setup to exercise actual plugin code paths.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ParagraphNode, $getRoot, LexicalEditor } from 'lexical';
import { FileBlockNode } from '../nodes/FileBlockNode/FileBlockNode';
import {
  InsertFilePlugin,
  INSERT_FILE_BLOCK_COMMAND,
} from './InsertFilePlugin';
import { MediaContext } from '../EditorProvider';
import { EditorMediaConfig } from '../media-config';

// Test helper to capture editor reference
let capturedEditor: LexicalEditor | null = null;
const EditorCapture = () => {
  const [editor] = useLexicalComposerContext();
  capturedEditor = editor;
  return null;
};

describe('InsertFilePlugin Integration', () => {
  beforeEach(() => {
    capturedEditor = null;
  });

  afterEach(() => {
    cleanup();
  });

  const renderEditor = (mediaConfig: EditorMediaConfig | null) => {
    return render(
      <LexicalComposer
        initialConfig={{
          namespace: 'InsertFileIntegration',
          nodes: [FileBlockNode, ParagraphNode],
          onError: (error) => console.error(error),
        }}
      >
        <MediaContext.Provider value={mediaConfig}>
          <RichTextPlugin
            contentEditable={<ContentEditable />}
            placeholder={<div>Type here...</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <InsertFilePlugin />
          <EditorCapture />
        </MediaContext.Provider>
      </LexicalComposer>,
    );
  };

  it('inserts file node via command dispatch', async () => {
    renderEditor(null);

    // Wait for editor to initialize
    await vi.waitFor(() => expect(capturedEditor).not.toBeNull());

    // Dispatch command
    capturedEditor!.update(() => {
      capturedEditor!.dispatchCommand(INSERT_FILE_BLOCK_COMMAND, {
        url: 'https://example.com/doc.pdf',
        filename: 'document.pdf',
        size: 1024,
        mime: 'application/pdf',
      });
    });

    // Verify node was inserted
    capturedEditor!.read(() => {
      const root = $getRoot();
      expect(root.getChildrenSize()).toBeGreaterThan(0);
    });
  });

  it('triggers upload flow when file is provided', async () => {
    const uploadFile = vi.fn().mockResolvedValue({
      url: 'https://cdn.example.com/uploaded.pdf',
      mime: 'application/pdf',
      size: 1024,
    });
    const onUploadStart = vi.fn();

    renderEditor({
      uploadAdapter: { uploadFile },
      callbacks: { onUploadStart },
      maxFileSizeMB: 10,
    });

    await vi.waitFor(() => expect(capturedEditor).not.toBeNull());

    const file = new File(['test content'], 'test.pdf', {
      type: 'application/pdf',
    });

    capturedEditor!.update(() => {
      capturedEditor!.dispatchCommand(INSERT_FILE_BLOCK_COMMAND, {
        url: '',
        filename: file.name,
        file,
      });
    });

    // Verify upload was triggered
    expect(onUploadStart).toHaveBeenCalledWith(file, 'file');
    expect(uploadFile).toHaveBeenCalled();
  });

  it('shows alert for file exceeding size limit', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const uploadFile = vi.fn();

    renderEditor({
      uploadAdapter: { uploadFile },
      maxFileSizeMB: 1,
    });

    await vi.waitFor(() => expect(capturedEditor).not.toBeNull());

    // Create 2MB file
    const largeContent = new Array(2 * 1024 * 1024).fill('x').join('');
    const file = new File([largeContent], 'large.pdf', {
      type: 'application/pdf',
    });

    capturedEditor!.update(() => {
      capturedEditor!.dispatchCommand(INSERT_FILE_BLOCK_COMMAND, {
        url: '',
        filename: file.name,
        file,
      });
    });

    expect(alertSpy).toHaveBeenCalledWith('File size exceeds 1MB');
    expect(uploadFile).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('calls onUploadComplete after successful upload', async () => {
    const uploadResult = {
      url: 'https://cdn.example.com/success.pdf',
      mime: 'application/pdf',
      size: 512,
    };
    const uploadFile = vi.fn().mockResolvedValue(uploadResult);
    const onUploadComplete = vi.fn();

    renderEditor({
      uploadAdapter: { uploadFile },
      callbacks: { onUploadComplete },
      maxFileSizeMB: 10,
    });

    await vi.waitFor(() => expect(capturedEditor).not.toBeNull());

    const file = new File(['content'], 'success.pdf', {
      type: 'application/pdf',
    });

    capturedEditor!.update(() => {
      capturedEditor!.dispatchCommand(INSERT_FILE_BLOCK_COMMAND, {
        url: '',
        filename: file.name,
        file,
      });
    });

    await vi.waitFor(() => expect(onUploadComplete).toHaveBeenCalled());
    expect(onUploadComplete).toHaveBeenCalledWith(file, uploadResult);
  });

  it('calls onUploadError when upload fails', async () => {
    const uploadError = new Error('Upload failed');
    const uploadFile = vi.fn().mockRejectedValue(uploadError);
    const onUploadError = vi.fn();

    renderEditor({
      uploadAdapter: { uploadFile },
      callbacks: { onUploadError },
      maxFileSizeMB: 10,
    });

    await vi.waitFor(() => expect(capturedEditor).not.toBeNull());

    const file = new File(['content'], 'fail.pdf', {
      type: 'application/pdf',
    });

    capturedEditor!.update(() => {
      capturedEditor!.dispatchCommand(INSERT_FILE_BLOCK_COMMAND, {
        url: '',
        filename: file.name,
        file,
      });
    });

    await vi.waitFor(() => expect(onUploadError).toHaveBeenCalled());
    expect(onUploadError).toHaveBeenCalledWith(file, uploadError);
  });

  it('calls onUploadProgress during upload', async () => {
    let progressCallback: ((p: number) => void) | undefined;
    const uploadFile = vi.fn((file, options) => {
      progressCallback = options?.onProgress;
      return Promise.resolve({
        url: 'https://example.com/result.pdf',
        mime: 'application/pdf',
        size: 100,
      });
    });
    const onUploadProgress = vi.fn();

    renderEditor({
      uploadAdapter: { uploadFile },
      callbacks: { onUploadProgress },
      maxFileSizeMB: 10,
    });

    await vi.waitFor(() => expect(capturedEditor).not.toBeNull());

    const file = new File(['content'], 'progress.pdf', {
      type: 'application/pdf',
    });

    capturedEditor!.update(() => {
      capturedEditor!.dispatchCommand(INSERT_FILE_BLOCK_COMMAND, {
        url: '',
        filename: file.name,
        file,
      });
    });

    // Simulate progress
    if (progressCallback) {
      progressCallback(50);
    }

    await vi.waitFor(() => expect(onUploadProgress).toHaveBeenCalled());
    expect(onUploadProgress).toHaveBeenCalledWith(file, 50);
  });
});
