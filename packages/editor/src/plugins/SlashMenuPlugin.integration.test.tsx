import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup, screen, waitFor, act } from '@testing-library/react';
import React from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ParagraphNode, TextNode, $getRoot, $createParagraphNode, $createTextNode, LexicalEditor } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { HeadingNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table';
import { CodeNode } from '@lexical/code';
import { SlashMenuPlugin } from './SlashMenuPlugin';
import { MediaContext } from '../EditorProvider';
import { defaultSlashCommands, filterSlashCommands } from '../components/SlashMenu';
import { ImageBlockNode } from '../nodes/ImageBlockNode';
import { VideoBlockNode } from '../nodes/VideoBlockNode';
import { FileBlockNode } from '../nodes/FileBlockNode/FileBlockNode';
import { PanelBlockNode } from '../nodes/PanelBlockNode/PanelBlockNode';
import { StatusNode } from '../nodes/StatusNode';
import { InsertImagePlugin } from './InsertImagePlugin';
import { InsertVideoPlugin } from './InsertVideoPlugin';
import { InsertFilePlugin } from './InsertFilePlugin';
import { InsertPanelPlugin } from './InsertPanelPlugin';
import { InsertStatusPlugin } from './InsertStatusPlugin';

// Helper to get the editor instance
let testEditor: LexicalEditor | null = null;

function EditorCapture() {
    const [editor] = useLexicalComposerContext();
    React.useEffect(() => {
        testEditor = editor;
    }, [editor]);
    return null;
}

function FullEditorWithSlashMenu() {
    const initialConfig = {
        namespace: 'IntegrationTestEditor',
        nodes: [
            ParagraphNode, TextNode, HeadingNode, ListNode, ListItemNode,
            TableNode, TableCellNode, TableRowNode, CodeNode,
            ImageBlockNode, VideoBlockNode, FileBlockNode, PanelBlockNode, StatusNode
        ],
        onError: (error: Error) => console.error(error),
        theme: {
            panel: 'panel-node',
        },
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
                <InsertImagePlugin />
                <InsertVideoPlugin />
                <InsertPanelPlugin />
                <InsertStatusPlugin />
                <EditorCapture />
            </MediaContext.Provider>
        </LexicalComposer>
    );
}

describe('SlashMenuPlugin Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        testEditor = null;
    });

    afterEach(() => {
        cleanup();
    });

    test('renders editor with SlashMenuPlugin', async () => {
        render(<FullEditorWithSlashMenu />);
        expect(screen.getByTestId('editor')).toBeInTheDocument();
    });

    test('editor is accessible after mount', async () => {
        render(<FullEditorWithSlashMenu />);

        await waitFor(() => {
            expect(testEditor).not.toBeNull();
        });

        expect(testEditor?.getEditorState()).toBeDefined();
    });

    test('can read root node from editor', async () => {
        render(<FullEditorWithSlashMenu />);

        await waitFor(() => {
            expect(testEditor).not.toBeNull();
        });

        testEditor!.getEditorState().read(() => {
            const root = $getRoot();
            expect(root).toBeDefined();
        });
    });

    test('can update editor with text', async () => {
        render(<FullEditorWithSlashMenu />);

        await waitFor(() => {
            expect(testEditor).not.toBeNull();
        });

        await act(async () => {
            testEditor!.update(() => {
                const root = $getRoot();
                root.clear();
                const paragraph = $createParagraphNode();
                const text = $createTextNode('Hello World');
                paragraph.append(text);
                root.append(paragraph);
            });
        });

        testEditor!.getEditorState().read(() => {
            const root = $getRoot();
            expect(root.getTextContent()).toBe('Hello World');
        });
    });
});

describe('SlashMenu Core Functions (No Mocks)', () => {
    test('defaultSlashCommands has essential block types', () => {
        const commandNames = defaultSlashCommands.map(cmd => cmd.name);
        expect(commandNames).toContain('table');
        expect(commandNames).toContain('image');
        expect(commandNames).toContain('video');
    });

    test('filterSlashCommands filters correctly', () => {
        const tableResults = filterSlashCommands(defaultSlashCommands, 'table');
        expect(tableResults.length).toBeGreaterThan(0);
        expect(tableResults[0].name).toBe('table');
    });

    test('filterSlashCommands handles partial matches', () => {
        const results = filterSlashCommands(defaultSlashCommands, 'ima');
        expect(results.length).toBeGreaterThan(0);
        expect(results.some(r => r.name === 'image')).toBe(true);
    });

    test('each command has execute function', () => {
        defaultSlashCommands.forEach(cmd => {
            expect(typeof cmd.execute).toBe('function');
        });
    });

    test('table command has no modal type', () => {
        const tableCommand = defaultSlashCommands.find(c => c.name === 'table');
        expect(tableCommand?.modalType).toBeUndefined();
    });

    test('commands have correct modalType for media blocks', () => {
        const imageCommand = defaultSlashCommands.find(c => c.name === 'image');
        const videoCommand = defaultSlashCommands.find(c => c.name === 'video');

        expect(imageCommand?.modalType).toBe('media-image');
        expect(videoCommand?.modalType).toBe('media-video');
    });

    test('commands have keywords for search', () => {
        defaultSlashCommands.forEach(cmd => {
            expect(Array.isArray(cmd.keywords)).toBe(true);
        });
    });

    test('filterSlashCommands searches keywords', () => {
        // Find a command with keywords
        const cmdWithKeywords = defaultSlashCommands.find(c => c.keywords.length > 0);
        if (cmdWithKeywords && cmdWithKeywords.keywords[0]) {
            const results = filterSlashCommands(defaultSlashCommands, cmdWithKeywords.keywords[0]);
            expect(results.length).toBeGreaterThan(0);
        }
    });
});
