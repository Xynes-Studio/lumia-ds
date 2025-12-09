import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MediaInsertTabs } from './MediaInsertTabs';
import { MediaContext } from '../../EditorProvider';
import { EditorMediaConfig } from '../../media-config';
import React from 'react';

// Mock MediaContext
const createWrapper = (mediaConfig: EditorMediaConfig | null) => {
  return ({ children }: { children: React.ReactNode }) => (
    <MediaContext.Provider value={mediaConfig}>
      {children}
    </MediaContext.Provider>
  );
};

describe('MediaInsertTabs', () => {
  const defaultProps = {
    mediaType: 'image' as const,
    onInsertFromUrl: vi.fn(),
    onInsertFromFile: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Link Tab', () => {
    it('renders with Link tab active by default', () => {
      render(<MediaInsertTabs {...defaultProps} />, {
        wrapper: createWrapper(null),
      });

      expect(screen.getByRole('tab', { name: /embed link/i })).toHaveAttribute(
        'data-state',
        'active',
      );
    });

    it('shows URL input field', () => {
      render(<MediaInsertTabs {...defaultProps} />, {
        wrapper: createWrapper(null),
      });

      expect(screen.getByPlaceholderText(/example\.com/i)).toBeInTheDocument();
    });

    it('shows alt text input for images when showAltText is true', () => {
      render(<MediaInsertTabs {...defaultProps} showAltText={true} />, {
        wrapper: createWrapper(null),
      });

      expect(
        screen.getByPlaceholderText(/description of the image/i),
      ).toBeInTheDocument();
    });

    it('does not show alt text input when showAltText is false', () => {
      render(<MediaInsertTabs {...defaultProps} showAltText={false} />, {
        wrapper: createWrapper(null),
      });

      expect(
        screen.queryByPlaceholderText(/description of the image/i),
      ).not.toBeInTheDocument();
    });

    it('calls onInsertFromUrl with URL when Insert is clicked', () => {
      render(<MediaInsertTabs {...defaultProps} />, {
        wrapper: createWrapper(null),
      });

      const urlInput = screen.getByPlaceholderText(/example\.com/i);
      fireEvent.change(urlInput, {
        target: { value: 'https://example.com/image.jpg' },
      });

      const insertButton = screen.getByRole('button', { name: /insert/i });
      fireEvent.click(insertButton);

      expect(defaultProps.onInsertFromUrl).toHaveBeenCalledWith(
        'https://example.com/image.jpg',
        undefined,
      );
    });

    it('calls onInsertFromUrl with URL and alt text', () => {
      render(<MediaInsertTabs {...defaultProps} showAltText={true} />, {
        wrapper: createWrapper(null),
      });

      const urlInput = screen.getByPlaceholderText(/example\.com/i);
      fireEvent.change(urlInput, {
        target: { value: 'https://example.com/image.jpg' },
      });

      const altInput = screen.getByPlaceholderText(/description of the image/i);
      fireEvent.change(altInput, { target: { value: 'Test alt text' } });

      const insertButton = screen.getByRole('button', { name: /insert/i });
      fireEvent.click(insertButton);

      expect(defaultProps.onInsertFromUrl).toHaveBeenCalledWith(
        'https://example.com/image.jpg',
        { alt: 'Test alt text' },
      );
    });

    it('Insert button is disabled when URL is empty', () => {
      render(<MediaInsertTabs {...defaultProps} />, {
        wrapper: createWrapper(null),
      });

      const insertButton = screen.getByRole('button', { name: /insert/i });
      expect(insertButton).toBeDisabled();
    });

    it('calls onCancel when Cancel is clicked', () => {
      render(<MediaInsertTabs {...defaultProps} />, {
        wrapper: createWrapper(null),
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    it('uses custom placeholder when provided', () => {
      render(
        <MediaInsertTabs
          {...defaultProps}
          urlPlaceholder="https://custom.com"
        />,
        { wrapper: createWrapper(null) },
      );

      expect(
        screen.getByPlaceholderText('https://custom.com'),
      ).toBeInTheDocument();
    });
  });

  describe('Upload Tab', () => {
    const mediaConfigWithUpload: EditorMediaConfig = {
      uploadAdapter: {
        uploadFile: async (file: File) => ({
          url: 'https://example.com/uploaded.jpg',
          mime: file.type,
          size: file.size,
        }),
      },
      allowedImageTypes: ['image/jpeg', 'image/png'],
      allowedVideoTypes: ['video/mp4'],
      maxFileSizeMB: 5,
    };

    it('shows Upload tab when uploadAdapter is configured', () => {
      render(<MediaInsertTabs {...defaultProps} />, {
        wrapper: createWrapper(mediaConfigWithUpload),
      });

      expect(screen.getByRole('tab', { name: /upload/i })).toBeInTheDocument();
    });

    it('hides Upload tab when uploadAdapter is not configured', () => {
      render(<MediaInsertTabs {...defaultProps} />, {
        wrapper: createWrapper(null),
      });

      expect(
        screen.queryByRole('tab', { name: /upload/i }),
      ).not.toBeInTheDocument();
    });

    it('can switch to Upload tab', () => {
      render(<MediaInsertTabs {...defaultProps} />, {
        wrapper: createWrapper(mediaConfigWithUpload),
      });

      const uploadTab = screen.getByRole('tab', { name: /upload/i });
      fireEvent.click(uploadTab);

      expect(uploadTab).toHaveAttribute('data-state', 'active');
    });

    it('shows drag and drop instructions in Upload tab', () => {
      render(<MediaInsertTabs {...defaultProps} />, {
        wrapper: createWrapper(mediaConfigWithUpload),
      });

      const uploadTab = screen.getByRole('tab', { name: /upload/i });
      fireEvent.click(uploadTab);

      expect(screen.getByText(/drag and drop/i)).toBeInTheDocument();
      expect(screen.getByText(/choose file/i)).toBeInTheDocument();
    });

    it('shows file size limit', () => {
      render(<MediaInsertTabs {...defaultProps} />, {
        wrapper: createWrapper(mediaConfigWithUpload),
      });

      const uploadTab = screen.getByRole('tab', { name: /upload/i });
      fireEvent.click(uploadTab);

      expect(screen.getByText(/5MB/i)).toBeInTheDocument();
    });

    it('calls onInsertFromFile when file is selected', async () => {
      render(<MediaInsertTabs {...defaultProps} />, {
        wrapper: createWrapper(mediaConfigWithUpload),
      });

      const uploadTab = screen.getByRole('tab', { name: /upload/i });
      fireEvent.click(uploadTab);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByTestId('image-upload-input');

      Object.defineProperty(input, 'files', { value: [file] });
      fireEvent.change(input);

      await waitFor(() => {
        expect(defaultProps.onInsertFromFile).toHaveBeenCalledWith(file);
      });
    });
  });

  describe('Video Type', () => {
    it('shows video-specific placeholder', () => {
      render(
        <MediaInsertTabs
          {...defaultProps}
          mediaType="video"
          urlPlaceholder="https://youtube.com/watch?v=..."
        />,
        { wrapper: createWrapper(null) },
      );

      expect(
        screen.getByPlaceholderText('https://youtube.com/watch?v=...'),
      ).toBeInTheDocument();
    });

    it('shows video provider help text', () => {
      render(<MediaInsertTabs {...defaultProps} mediaType="video" />, {
        wrapper: createWrapper(null),
      });

      expect(screen.getByText(/youtube, vimeo, loom/i)).toBeInTheDocument();
    });
  });

  describe('File Type', () => {
    it('shows file-specific URL label', () => {
      render(<MediaInsertTabs {...defaultProps} mediaType="file" />, {
        wrapper: createWrapper(null),
      });

      expect(screen.getByText(/file url/i)).toBeInTheDocument();
    });

    it('shows default file placeholder', () => {
      render(<MediaInsertTabs {...defaultProps} mediaType="file" />, {
        wrapper: createWrapper(null),
      });

      expect(screen.getByPlaceholderText(/document\.pdf/i)).toBeInTheDocument();
    });

    it('shows file type hint in upload', () => {
      const mediaConfigWithUpload: EditorMediaConfig = {
        uploadAdapter: {
          uploadFile: async (file: File) => ({
            url: 'https://example.com/uploaded.pdf',
            mime: file.type,
            size: file.size,
          }),
        },
        maxFileSizeMB: 10,
      };

      render(<MediaInsertTabs {...defaultProps} mediaType="file" />, {
        wrapper: createWrapper(mediaConfigWithUpload),
      });

      // Switch to upload tab
      const uploadTab = screen.getByRole('tab', { name: /upload/i });
      fireEvent.click(uploadTab);

      expect(screen.getByText(/any file up to/i)).toBeInTheDocument();
    });
  });

  describe('Drag and Drop', () => {
    const mediaConfigWithUpload: EditorMediaConfig = {
      uploadAdapter: {
        uploadFile: async (file: File) => ({
          url: 'https://example.com/uploaded.jpg',
          mime: file.type,
          size: file.size,
        }),
      },
      allowedImageTypes: ['image/jpeg', 'image/png'],
      maxFileSizeMB: 5,
    };

    it('handles drag over event', async () => {
      render(<MediaInsertTabs {...defaultProps} />, {
        wrapper: createWrapper(mediaConfigWithUpload),
      });

      const uploadTab = screen.getByRole('tab', { name: /upload/i });
      fireEvent.click(uploadTab);

      const dropZone = screen.getByText(/drag and drop/i).closest('div')!;

      fireEvent.dragOver(dropZone, {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      });

      // Should show visual feedback
      expect(dropZone.parentElement).toHaveClass('border-dashed');
    });

    it('handles drag leave event', async () => {
      render(<MediaInsertTabs {...defaultProps} />, {
        wrapper: createWrapper(mediaConfigWithUpload),
      });

      const uploadTab = screen.getByRole('tab', { name: /upload/i });
      fireEvent.click(uploadTab);

      const dropZone = screen.getByText(/drag and drop/i).closest('div')!;

      fireEvent.dragOver(dropZone);
      fireEvent.dragLeave(dropZone);

      // Visual feedback should be removed
      expect(dropZone.parentElement).toHaveClass('border-border');
    });

    it('handles file drop event', async () => {
      render(<MediaInsertTabs {...defaultProps} />, {
        wrapper: createWrapper(mediaConfigWithUpload),
      });

      const uploadTab = screen.getByRole('tab', { name: /upload/i });
      fireEvent.click(uploadTab);

      const dropZone = screen
        .getByText(/drag and drop/i)
        .closest('div')!.parentElement!;

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const dataTransfer = {
        files: [file],
      };

      fireEvent.drop(dropZone, { dataTransfer });

      await waitFor(() => {
        expect(defaultProps.onInsertFromFile).toHaveBeenCalledWith(file);
      });
    });
  });

  describe('File Validation', () => {
    const mediaConfigWithUpload: EditorMediaConfig = {
      uploadAdapter: {
        uploadFile: async (file: File) => ({
          url: 'https://example.com/uploaded.jpg',
          mime: file.type,
          size: file.size,
        }),
      },
      allowedImageTypes: ['image/jpeg', 'image/png'],
      maxFileSizeMB: 1,
    };

    it('rejects files with invalid type', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      render(<MediaInsertTabs {...defaultProps} mediaType="image" />, {
        wrapper: createWrapper(mediaConfigWithUpload),
      });

      const uploadTab = screen.getByRole('tab', { name: /upload/i });
      fireEvent.click(uploadTab);

      const file = new File(['test'], 'test.gif', { type: 'image/gif' });
      const input = screen.getByTestId('image-upload-input');

      Object.defineProperty(input, 'files', { value: [file] });
      fireEvent.change(input);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          expect.stringContaining('not allowed'),
        );
      });

      expect(defaultProps.onInsertFromFile).not.toHaveBeenCalled();
      alertSpy.mockRestore();
    });

    it('rejects files exceeding size limit', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      render(<MediaInsertTabs {...defaultProps} mediaType="image" />, {
        wrapper: createWrapper(mediaConfigWithUpload),
      });

      const uploadTab = screen.getByRole('tab', { name: /upload/i });
      fireEvent.click(uploadTab);

      // Create a file larger than 1MB
      const largeContent = new Array(2 * 1024 * 1024).fill('a').join('');
      const file = new File([largeContent], 'large.jpg', {
        type: 'image/jpeg',
      });
      const input = screen.getByTestId('image-upload-input');

      Object.defineProperty(input, 'files', { value: [file] });
      fireEvent.change(input);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          expect.stringContaining('exceeds'),
        );
      });

      expect(defaultProps.onInsertFromFile).not.toHaveBeenCalled();
      alertSpy.mockRestore();
    });
  });

  describe('Video Upload Tab', () => {
    const videoMediaConfig: EditorMediaConfig = {
      uploadAdapter: {
        uploadFile: async (file: File) => ({
          url: 'https://example.com/uploaded.mp4',
          mime: file.type,
          size: file.size,
        }),
      },
      allowedVideoTypes: ['video/mp4', 'video/webm'],
      maxFileSizeMB: 50,
    };

    it('shows video type hint in upload', () => {
      render(<MediaInsertTabs {...defaultProps} mediaType="video" />, {
        wrapper: createWrapper(videoMediaConfig),
      });

      const uploadTab = screen.getByRole('tab', { name: /upload/i });
      fireEvent.click(uploadTab);

      expect(screen.getByText(/mp4, webm/i)).toBeInTheDocument();
    });

    it('accepts video file types', async () => {
      render(<MediaInsertTabs {...defaultProps} mediaType="video" />, {
        wrapper: createWrapper(videoMediaConfig),
      });

      const uploadTab = screen.getByRole('tab', { name: /upload/i });
      fireEvent.click(uploadTab);

      const file = new File(['video content'], 'test.mp4', {
        type: 'video/mp4',
      });
      const input = screen.getByTestId('video-upload-input');

      Object.defineProperty(input, 'files', { value: [file] });
      fireEvent.change(input);

      await waitFor(() => {
        expect(defaultProps.onInsertFromFile).toHaveBeenCalledWith(file);
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('inserts from URL on Enter key', () => {
      render(<MediaInsertTabs {...defaultProps} />, {
        wrapper: createWrapper(null),
      });

      const urlInput = screen.getByPlaceholderText(/example\.com/i);
      fireEvent.change(urlInput, {
        target: { value: 'https://example.com/image.jpg' },
      });

      fireEvent.keyDown(urlInput, { key: 'Enter' });

      expect(defaultProps.onInsertFromUrl).toHaveBeenCalledWith(
        'https://example.com/image.jpg',
        undefined,
      );
    });

    it('inserts from alt text field on Enter key', () => {
      render(<MediaInsertTabs {...defaultProps} showAltText={true} />, {
        wrapper: createWrapper(null),
      });

      const urlInput = screen.getByPlaceholderText(/example\.com/i);
      fireEvent.change(urlInput, {
        target: { value: 'https://example.com/image.jpg' },
      });

      const altInput = screen.getByPlaceholderText(/description/i);
      fireEvent.change(altInput, { target: { value: 'My image' } });
      fireEvent.keyDown(altInput, { key: 'Enter' });

      expect(defaultProps.onInsertFromUrl).toHaveBeenCalledWith(
        'https://example.com/image.jpg',
        { alt: 'My image' },
      );
    });
  });
});
