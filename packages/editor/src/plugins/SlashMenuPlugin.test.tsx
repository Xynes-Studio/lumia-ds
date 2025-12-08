import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ParagraphNode, TextNode, $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { SlashMenuPlugin } from './SlashMenuPlugin';
import { MediaContext } from '../EditorProvider';
import { defaultSlashCommands, filterSlashCommands } from '../components/SlashMenu';

// Use importOriginal to avoid Proxy hang
vi.mock('lucide-react', async (importOriginal) => {
  return await importOriginal();
});

// Helper to set up editor with initial content
function SetupPlugin({ onReady }: { onReady?: (editor: any) => void }) {
  const [editor] = useLexicalComposerContext();
  React.useEffect(() => {
    if (onReady) onReady(editor);
  }, [editor, onReady]);
  return null;
}

function EditorWithSlashMenu({ onReady }: { onReady?: (editor: any) => void } = {}) {
  const initialConfig = {
    namespace: 'TestEditor',
    nodes: [ParagraphNode, TextNode],
    onError: (error: Error) => console.error(error),
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <MediaContext.Provider value={null}>
        <RichTextPlugin
          contentEditable={<ContentEditable className="editor-input" data-testid="editor" />}
          placeholder={<div className="editor-placeholder">Type / for commands...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <SlashMenuPlugin />
        <SetupPlugin onReady={onReady} />
      </MediaContext.Provider>
    </LexicalComposer>
  );
}

describe('SlashMenuPlugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.getSelection = vi.fn().mockReturnValue({
      rangeCount: 1,
      getRangeAt: () => ({
        getBoundingClientRect: () => ({ bottom: 100, left: 100, width: 10, height: 20 }),
      }),
      anchorNode: document.createElement('div'),
    });
  });

  afterEach(() => {
    cleanup();
  });

  test('renders without crashing', () => {
    const { container } = render(<EditorWithSlashMenu />);
    expect(container.querySelector('.editor-input')).toBeInTheDocument();
  });

  test('SlashMenuPlugin exports correctly', () => {
    expect(SlashMenuPlugin).toBeDefined();
    expect(typeof SlashMenuPlugin).toBe('function');
  });

  test('does not show menu initially', () => {
    render(<EditorWithSlashMenu />);
    expect(screen.queryByTestId('slash-menu')).not.toBeInTheDocument();
  });
});

describe('SlashMenu Commands', () => {
  test('defaultSlashCommands exports commands array', () => {
    expect(defaultSlashCommands).toBeDefined();
    expect(Array.isArray(defaultSlashCommands)).toBe(true);
    expect(defaultSlashCommands.length).toBeGreaterThan(0);
  });

  test('filterSlashCommands filters by query', () => {
    // Filter for 'video' which should match video command
    const result = filterSlashCommands(defaultSlashCommands, 'video');
    expect(result.length).toBeGreaterThan(0);
    // Check that all returned commands have 'video' in name, label, or keywords
    result.forEach(cmd => {
      const hasMatch =
        cmd.name.toLowerCase().includes('video') ||
        cmd.label.toLowerCase().includes('video') ||
        cmd.keywords.some(k => k.toLowerCase().includes('video'));
      expect(hasMatch).toBe(true);
    });
  });

  test('filterSlashCommands returns all with empty query', () => {
    const result = filterSlashCommands(defaultSlashCommands, '');
    expect(result).toEqual(defaultSlashCommands);
  });

  test('filterSlashCommands returns empty for no match', () => {
    const result = filterSlashCommands(defaultSlashCommands, 'xyznonexistent');
    expect(result.length).toBe(0);
  });

  test('each command has required properties', () => {
    defaultSlashCommands.forEach(cmd => {
      expect(cmd).toHaveProperty('name');
      expect(cmd).toHaveProperty('label');
      expect(cmd).toHaveProperty('icon');
      expect(cmd).toHaveProperty('execute');
      expect(typeof cmd.execute).toBe('function');
    });
  });
});
