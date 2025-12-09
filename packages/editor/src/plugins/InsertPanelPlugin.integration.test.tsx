/**
 * Integration tests for InsertPanelPlugin.
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
import { PanelBlockNode } from '../nodes/PanelBlockNode/PanelBlockNode';
import { InsertPanelPlugin, INSERT_PANEL_COMMAND } from './InsertPanelPlugin';

let capturedEditor: LexicalEditor | null = null;
const EditorCapture = () => {
    const [editor] = useLexicalComposerContext();
    capturedEditor = editor;
    return null;
};

describe('InsertPanelPlugin Integration', () => {
    beforeEach(() => {
        capturedEditor = null;
    });

    afterEach(() => {
        cleanup();
    });

    const renderEditor = () => {
        return render(
            <LexicalComposer
                initialConfig={{
                    namespace: 'InsertPanelIntegration',
                    nodes: [PanelBlockNode, ParagraphNode],
                    onError: (error) => console.error(error),
                }}
            >
                <RichTextPlugin
                    contentEditable={<ContentEditable />}
                    placeholder={<div>Type here...</div>}
                    ErrorBoundary={LexicalErrorBoundary}
                />
                <InsertPanelPlugin />
                <EditorCapture />
            </LexicalComposer>,
        );
    };

    it('inserts info panel via command', async () => {
        renderEditor();
        await vi.waitFor(() => expect(capturedEditor).not.toBeNull());

        capturedEditor!.update(() => {
            capturedEditor!.dispatchCommand(INSERT_PANEL_COMMAND, {
                variant: 'info',
                title: 'Information',
            });
        });

        // Wait for update to complete
        await new Promise((resolve) => setTimeout(resolve, 50));

        capturedEditor!.read(() => {
            const root = $getRoot();
            // Editor should have children after insertion
            expect(root.getChildrenSize()).toBeGreaterThan(0);
        });
    });

    it('inserts warning panel via command', async () => {
        renderEditor();
        await vi.waitFor(() => expect(capturedEditor).not.toBeNull());

        capturedEditor!.update(() => {
            capturedEditor!.dispatchCommand(INSERT_PANEL_COMMAND, {
                variant: 'warning',
                title: 'Warning',
            });
        });

        await new Promise((resolve) => setTimeout(resolve, 50));

        capturedEditor!.read(() => {
            const root = $getRoot();
            expect(root.getChildrenSize()).toBeGreaterThan(0);
        });
    });

    it('inserts success panel via command', async () => {
        renderEditor();
        await vi.waitFor(() => expect(capturedEditor).not.toBeNull());

        capturedEditor!.update(() => {
            capturedEditor!.dispatchCommand(INSERT_PANEL_COMMAND, {
                variant: 'success',
                title: 'Success',
            });
        });

        await new Promise((resolve) => setTimeout(resolve, 50));

        capturedEditor!.read(() => {
            const root = $getRoot();
            expect(root.getChildrenSize()).toBeGreaterThan(0);
        });
    });

    it('inserts panel with custom icon', async () => {
        renderEditor();
        await vi.waitFor(() => expect(capturedEditor).not.toBeNull());

        capturedEditor!.update(() => {
            capturedEditor!.dispatchCommand(INSERT_PANEL_COMMAND, {
                variant: 'note',
                title: 'Note',
                icon: 'bookmark',
            });
        });

        await new Promise((resolve) => setTimeout(resolve, 50));

        capturedEditor!.read(() => {
            const root = $getRoot();
            expect(root.getChildrenSize()).toBeGreaterThan(0);
        });
    });
});
