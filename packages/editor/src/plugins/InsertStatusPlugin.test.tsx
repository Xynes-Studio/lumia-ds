import { describe, test, expect, vi, beforeEach } from 'vitest';
import { createHeadlessEditor } from '@lexical/headless';
import { $getRoot, $getSelection, $isRangeSelection, ParagraphNode, TextNode } from 'lexical';
import { StatusNode, $isStatusNode } from '../nodes/StatusNode/StatusNode';
import { INSERT_STATUS_COMMAND } from './InsertStatusPlugin';

describe('InsertStatusPlugin', () => {
    let editor: ReturnType<typeof createHeadlessEditor>;

    beforeEach(() => {
        editor = createHeadlessEditor({
            nodes: [StatusNode, ParagraphNode, TextNode],
            onError: (error) => {
                throw error;
            },
        });
    });

    test('INSERT_STATUS_COMMAND should insert a StatusNode', () => {
        // Setup initial state with a paragraph and selection
        editor.update(() => {
            const root = $getRoot();
            const paragraph = new ParagraphNode();
            const text = new TextNode('');
            paragraph.append(text);
            root.append(paragraph);
            text.select();
        });

        // Dispatch the command
        editor.dispatchCommand(INSERT_STATUS_COMMAND, {
            text: 'In Progress',
            color: 'info',
        });

        // Verify the node was inserted
        editor.read(() => {
            const root = $getRoot();
            const paragraph = root.getFirstChild();
            expect(paragraph).toBeDefined();

            // Find the status node in the paragraph
            if (paragraph) {
                const children = (paragraph as ParagraphNode).getChildren();
                const statusNode = children.find((child) => $isStatusNode(child));
                expect(statusNode).toBeDefined();
                if (statusNode && $isStatusNode(statusNode)) {
                    expect(statusNode.getText()).toBe('In Progress');
                    expect(statusNode.getColor()).toBe('info');
                }
            }
        });
    });

    test('INSERT_STATUS_COMMAND should insert with default values', () => {
        editor.update(() => {
            const root = $getRoot();
            const paragraph = new ParagraphNode();
            const text = new TextNode('');
            paragraph.append(text);
            root.append(paragraph);
            text.select();
        });

        editor.dispatchCommand(INSERT_STATUS_COMMAND, {
            text: 'Status',
            color: 'info',
        });

        editor.read(() => {
            const root = $getRoot();
            const paragraph = root.getFirstChild() as ParagraphNode;
            const children = paragraph?.getChildren() || [];
            const statusNode = children.find((child) => $isStatusNode(child));
            expect(statusNode).toBeDefined();
            if (statusNode && $isStatusNode(statusNode)) {
                expect(statusNode.getText()).toBe('Status');
                expect(statusNode.getColor()).toBe('info');
            }
        });
    });

    test('INSERT_STATUS_COMMAND should work with different colors', () => {
        const colors = ['success', 'warning', 'error', 'info'] as const;

        for (const testColor of colors) {
            editor.update(() => {
                const root = $getRoot();
                root.clear();
                const paragraph = new ParagraphNode();
                const text = new TextNode('');
                paragraph.append(text);
                root.append(paragraph);
                text.select();
            });

            editor.dispatchCommand(INSERT_STATUS_COMMAND, {
                text: `Test ${testColor}`,
                color: testColor,
            });

            editor.read(() => {
                const root = $getRoot();
                const paragraph = root.getFirstChild() as ParagraphNode;
                const children = paragraph?.getChildren() || [];
                const statusNode = children.find((child) => $isStatusNode(child));
                expect(statusNode).toBeDefined();
                if (statusNode && $isStatusNode(statusNode)) {
                    expect(statusNode.getColor()).toBe(testColor);
                }
            });
        }
    });
});
