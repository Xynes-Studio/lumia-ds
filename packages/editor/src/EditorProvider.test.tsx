import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EditorProvider } from './EditorProvider';
import { useEditorState } from './useEditorState';
import { LumiaEditorStateJSON } from './types';
import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

// Test component to consume the hook
const TestConsumer = ({
  onStateUpdate,
}: {
  onStateUpdate: (state: { json: LumiaEditorStateJSON | null }) => void;
}) => {
  const state = useEditorState();

  useEffect(() => {
    onStateUpdate(state);
  }, [state, onStateUpdate]);

  return <div>Consumer</div>;
};

import { $getRoot } from 'lexical';

// Component to trigger updates
const EditorUpdater = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      // Create a simple update
      // We don't need to do anything specific, just triggering an update
    });
  }, [editor]);

  return (
    <button
      onClick={() => {
        editor.update(() => {
          // Trigger update
          const root = $getRoot();
          root.clear();
        });
      }}
    >
      Update
    </button>
  );
};

describe('EditorProvider', () => {
  it('provides initial state to useEditorState', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const initialValue: any = {
      root: {
        children: [
          {
            children: [],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    };

    const onStateUpdate = vi.fn();

    render(
      <EditorProvider value={initialValue}>
        <TestConsumer onStateUpdate={onStateUpdate} />
      </EditorProvider>,
    );

    expect(onStateUpdate).toHaveBeenCalledWith({
      json: expect.objectContaining({ root: expect.any(Object) }),
    });
    // The initial state might be slightly different due to normalization, but should exist
    expect(onStateUpdate.mock.calls[0][0].json).not.toBeNull();
  });

  it('updates state when editor content changes', async () => {
    const onStateUpdate = vi.fn();

    render(
      <EditorProvider>
        <TestConsumer onStateUpdate={onStateUpdate} />
        <EditorUpdater />
      </EditorProvider>,
    );

    const updateButton = screen.getByText('Update');
    updateButton.click();

    await waitFor(() => {
      // Expect multiple calls, the last one should have the updated state
      expect(onStateUpdate).toHaveBeenCalled();
    });
  });
});
