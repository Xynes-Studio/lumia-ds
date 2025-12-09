import { vi, describe, beforeEach, it, expect, Mock } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEditorState } from './useEditorState';
import { useEditorContext } from './EditorProvider';

// Mock EditorProvider
vi.mock('./EditorProvider', () => ({
  useEditorContext: vi.fn(),
}));

describe('useEditorState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null json when editorState is null', () => {
    (useEditorContext as Mock).mockReturnValue({
      editorState: null,
    });

    const { result } = renderHook(() => useEditorState());

    expect(result.current.json).toBeNull();
  });

  it('returns editor state json when available', () => {
    const mockEditorState = {
      root: {
        children: [{ type: 'paragraph' }],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    };

    (useEditorContext as Mock).mockReturnValue({
      editorState: mockEditorState,
    });

    const { result } = renderHook(() => useEditorState());

    expect(result.current.json).toEqual(mockEditorState);
  });

  it('returns object with json property', () => {
    (useEditorContext as Mock).mockReturnValue({
      editorState: null,
    });

    const { result } = renderHook(() => useEditorState());

    expect(result.current).toHaveProperty('json');
  });
});
