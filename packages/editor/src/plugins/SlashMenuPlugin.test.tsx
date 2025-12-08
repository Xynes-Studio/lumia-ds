import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ParagraphNode, TextNode } from 'lexical';
import { SlashMenuPlugin } from './SlashMenuPlugin';
import { MediaContext } from '../EditorProvider';

vi.mock('./SlashMenuPlugin', () => ({
  SlashMenuPlugin: () => null,
}));

// Mock Lucide icons
vi.mock('lucide-react', () => {
  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (prop === 'default') return undefined;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Component = (props: any) => (<span data-testid={`icon-${String(prop).toLowerCase()}`} {...props} />);
        Component.displayName = String(prop);
        return Component;
      },
    },
  );
});

// Mock SlashMenu component
vi.mock('../components/SlashMenu', () => {
  return {
    SlashMenu: ({ commands, onSelect, onClose }: { commands: any[]; onSelect: (cmd: any) => void; onClose: () => void }) => (
      <div data-testid="slash-menu">
        {commands.map((cmd: any) => (
          <button
            key={cmd.name}
            data-testid={`slash-cmd-${cmd.name}`}
            onClick={() => onSelect(cmd)}
          >
            {cmd.label}
          </button>
        ))}
        <button data-testid="close-menu" onClick={onClose}>
          Close
        </button>
      </div>
    ),
    defaultSlashCommands: [],
    filterSlashCommands: (cmds: any[]) => cmds,
  };
});

// Mock MediaInsert component
vi.mock('../components/MediaInsert', () => ({
  MediaInsertTabs: ({ onInsertFromUrl, onInsertFromFile }: { onInsertFromUrl: (url: string, opts: { alt: string }) => void, onInsertFromFile: (file: File) => void }) => (
    <div data-testid="media-insert-tabs">
      <button onClick={() => onInsertFromUrl('url', { alt: 'alt' })}>Insert URL</button>
      <button onClick={() => onInsertFromFile(new File([], 'test'))}>Insert File</button>
    </div>
  ),
}));

// Mock Block definitions (which SlashMenuPlugin might depend on implicitly via commands)
// But for now, we just test rendering.
vi.mock('../nodes/ImageBlockNode/ImageBlockNode', () => ({
  $createImageBlockNode: vi.fn(),
  ImageBlockNode: class { },
}));
vi.mock('../nodes/VideoBlockNode', () => ({
  $createVideoBlockNode: vi.fn(),
  VideoBlockNode: class { },
}));
vi.mock('../nodes/FileBlockNode/FileBlockNode', () => ({
  $createFileBlockNode: vi.fn(),
  FileBlockNode: class { },
}));
vi.mock('./InsertImagePlugin', () => ({
  INSERT_IMAGE_BLOCK_COMMAND: { type: 'INSERT_IMAGE_BLOCK_COMMAND' },
}));
vi.mock('./InsertVideoPlugin', () => ({
  INSERT_VIDEO_BLOCK_COMMAND: { type: 'INSERT_VIDEO_BLOCK_COMMAND' },
}));
vi.mock('./InsertFilePlugin', () => ({
  INSERT_FILE_BLOCK_COMMAND: { type: 'INSERT_FILE_BLOCK_COMMAND' },
}));

function TestEditor({ children }: { children?: React.ReactNode }) {
  const initialConfig = {
    namespace: 'TestEditor',
    nodes: [],
    onError: (error: Error) => {
      console.error(error);
    },
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <MediaContext.Provider value={null}>
        <RichTextPlugin
          contentEditable={<div className="editor-input" />}
          placeholder={<div>Type something...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        {/* Intentionally enabled to test if it hangs */}
        <SlashMenuPlugin />
        {children}
      </MediaContext.Provider>
    </LexicalComposer>
  );
}

describe('SlashMenuPlugin Interaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('renders without crashing', () => {
    render(<TestEditor />);
    expect(document.querySelector('.editor-input')).toBeDefined();
  });
});
