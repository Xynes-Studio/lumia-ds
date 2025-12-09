import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { useSlashMenuQuery } from '../useSlashMenuQuery';
import { renderWithEditor } from '../../test-utils/LexicalTestHarness';
import {
  $getRoot,
  $createParagraphNode,
  $isElementNode,
  $isTextNode,
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createRangeSelection, $setSelection, $createTextNode } from 'lexical';
import { processQueryUpdate } from '../../utils/slashMenuUtils';

// Mock the utils to verify orchestration
// Mock the utils to verify orchestration
vi.mock('../../utils/slashMenuUtils', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual: any = await importOriginal();
  return {
    ...actual,
    processQueryUpdate: vi.fn(() => ({
      shouldUpdate: true,
      shouldClose: false,
      query: 'test',
    })),
  };
});

describe('useSlashMenuQuery Integration', () => {
  const mockOnUpdateQuery = vi.fn();
  const mockOnClose = vi.fn();

  it('updates query when typing after trigger', async () => {
    // Component to handle setup and testing together
    const TestScenario = ({
      onUpdateQuery,
      onClose,
    }: {
      onUpdateQuery: (q: string) => void;
      onClose: () => void;
    }) => {
      const [editor] = useLexicalComposerContext();
      const [triggerKey, setTriggerKey] = React.useState<string | null>(null);

      React.useEffect(() => {
        editor.update(() => {
          const root = $getRoot();
          root.clear(); // Clear any existing content
          const p = $createParagraphNode();
          const text = $createTextNode('/');
          p.append(text);
          root.append(p);
          text.select();
          setTriggerKey(text.getKey());
        });
      }, [editor]);

      useSlashMenuQuery({
        editor,
        isOpen: true,
        triggerNodeKey: triggerKey,
        triggerOffset: 0,
        onUpdateQuery,
        onClose,
      });

      return <div data-testid="scenario" data-ready={!!triggerKey} />;
    };

    const { editor } = renderWithEditor(
      <TestScenario onUpdateQuery={mockOnUpdateQuery} onClose={mockOnClose} />,
    );

    // Wait for setup to complete
    await waitFor(() => {
      expect(screen.getByTestId('scenario')).toHaveAttribute(
        'data-ready',
        'true',
      );
      editor.getEditorState().read(() => {
        const root = $getRoot();
        expect(root.getTextContent()).toBe('/');
      });
    });

    // Simulate typing by updating the specific text node
    await editor.update(() => {
      // We need to find the node again as key is local to TestScenario state
      // But since we cleared and added one text node, we can find it via root
      const root = $getRoot();
      const p = root.getFirstChild();
      let text;
      if (p && $isElementNode(p)) {
        text = p.getFirstChild();
      }
      if (text && $isTextNode(text)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (text as any).setTextContent('/test');
        const selection = $createRangeSelection();
        selection.anchor.set(text.getKey(), 5, 'text');
        selection.focus.set(text.getKey(), 5, 'text');
        $setSelection(selection);
      }
    });

    await waitFor(() => {
      expect(mockOnUpdateQuery).toHaveBeenCalledWith('test');
    });
  });

  it('closes menu when space is typed', async () => {
    // Mock allow closing for this test
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (processQueryUpdate as any).mockReturnValue({
      shouldUpdate: false,
      shouldClose: true,
      query: '',
    });

    const TestScenario = ({
      onUpdateQuery,
      onClose,
    }: {
      onUpdateQuery: (q: string) => void;
      onClose: () => void;
    }) => {
      const [editor] = useLexicalComposerContext();
      const [triggerKey, setTriggerKey] = React.useState<string | null>(null);

      React.useEffect(() => {
        editor.update(() => {
          const root = $getRoot();
          root.clear();
          const p = $createParagraphNode();
          const text = $createTextNode('/valid');
          p.append(text);
          root.append(p);
          text.select();
          setTriggerKey(text.getKey());
        });
      }, [editor]);

      useSlashMenuQuery({
        editor,
        isOpen: true,
        triggerNodeKey: triggerKey,
        triggerOffset: 0,
        onUpdateQuery,
        onClose,
      });

      return <div data-testid="scenario" data-ready={!!triggerKey} />;
    };

    const { editor } = renderWithEditor(
      <TestScenario onUpdateQuery={mockOnUpdateQuery} onClose={mockOnClose} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('scenario')).toHaveAttribute(
        'data-ready',
        'true',
      );
      editor.getEditorState().read(() => {
        const root = $getRoot();
        expect(root.getTextContent()).toBe('/valid');
      });
    });

    // Simulate typing space
    await editor.update(() => {
      const root = $getRoot();
      const p = root.getFirstChild();
      let text;
      if (p && $isElementNode(p)) {
        text = p.getFirstChild();
      }
      if (text && $isTextNode(text)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (text as any).setTextContent('/valid ');
        const selection = $createRangeSelection();
        selection.anchor.set(text.getKey(), 7, 'text'); // length of "/valid " is 7
        selection.focus.set(text.getKey(), 7, 'text');
        $setSelection(selection);
      }
    });

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
