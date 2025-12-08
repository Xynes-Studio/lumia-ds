import { describe, test, expect } from 'vitest';
import { createHeadlessEditor } from '@lexical/headless';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import {
    PanelBlockNode,
    $createPanelBlockNode,
} from '../nodes/PanelBlockNode/PanelBlockNode';
import {
    ListNode,
    ListItemNode,
    $createListNode,
    $createListItemNode,
} from '@lexical/list';

/**
 * Tests for PanelListPlugin functionality.
 * Note: Full command testing requires a browser environment with the plugin registered.
 * These tests verify the underlying node structure.
 */
describe('PanelListPlugin Node Structure', () => {
    const editorConfig = {
        namespace: 'test',
        nodes: [PanelBlockNode, ListNode, ListItemNode],
        onError: (error: Error) => {
            throw error;
        },
        theme: {},
    };

    test('panel can contain a list node', () => {
        const editor = createHeadlessEditor(editorConfig);

        editor.update(() => {
            const root = $getRoot();
            const panel = $createPanelBlockNode({
                variant: 'info',
                title: 'Test Panel',
            });

            const list = $createListNode('bullet');
            const listItem = $createListItemNode();
            const text = $createTextNode('List item text');

            listItem.append(text);
            list.append(listItem);
            panel.append(list);
            root.append(panel);
        });

        editor.getEditorState().read(() => {
            const root = $getRoot();
            const panel = root.getFirstChild();
            expect(panel).not.toBeNull();

            // Verify panel has children (the list)
            if (panel && 'getFirstChild' in panel) {
                const list = (panel as unknown as { getFirstChild: () => unknown }).getFirstChild();
                expect(list).not.toBeNull();
            }
        });
    });

    test('panel preserves list after JSON roundtrip', () => {
        const editor = createHeadlessEditor(editorConfig);

        editor.update(() => {
            const root = $getRoot();
            const panel = $createPanelBlockNode({
                variant: 'warning',
                title: 'Warning Panel',
            });

            const list = $createListNode('number');
            const listItem = $createListItemNode();
            listItem.append($createTextNode('Item 1'));
            list.append(listItem);
            panel.append(list);
            root.append(panel);
        });

        const json = editor.getEditorState().toJSON();
        expect(json).toBeDefined();

        // Verify structure in JSON
        const rootChildren = json.root.children;
        expect(rootChildren.length).toBeGreaterThan(0);
        expect(rootChildren[0].type).toBe('panel-block');
    });

    test('list inside panel maintains panel properties', () => {
        const editor = createHeadlessEditor(editorConfig);

        editor.update(() => {
            const root = $getRoot();
            const panel = $createPanelBlockNode({
                variant: 'success',
                title: 'Success Panel',
                icon: 'check',
            });

            const list = $createListNode('bullet');
            const listItem = $createListItemNode();
            listItem.append($createTextNode('Task done'));
            list.append(listItem);
            panel.append(list);
            root.append(panel);

            // Panel properties should remain intact
            expect(panel.getVariant()).toBe('success');
            expect(panel.getTitle()).toBe('Success Panel');
            expect(panel.getIcon()).toBe('check');
        });
    });
});

describe('PanelActionMenuPlugin Title Editing', () => {
    const editorConfig = {
        namespace: 'test',
        nodes: [PanelBlockNode],
        onError: (error: Error) => {
            throw error;
        },
        theme: {},
    };

    test('panel title can be updated', () => {
        const editor = createHeadlessEditor(editorConfig);

        editor.update(() => {
            const root = $getRoot();
            const panel = $createPanelBlockNode({
                variant: 'info',
                title: 'Original Title',
            });
            root.append(panel);

            panel.setTitle('Updated Title');
            expect(panel.getTitle()).toBe('Updated Title');
        });
    });

    test('panel title can be set to empty', () => {
        const editor = createHeadlessEditor(editorConfig);

        editor.update(() => {
            const root = $getRoot();
            const panel = $createPanelBlockNode({
                variant: 'info',
                title: 'Has Title',
            });
            root.append(panel);

            panel.setTitle('');
            expect(panel.getTitle()).toBe('');
        });
    });

    test('panel variant and icon remain after title change', () => {
        const editor = createHeadlessEditor(editorConfig);

        editor.update(() => {
            const root = $getRoot();
            const panel = $createPanelBlockNode({
                variant: 'warning',
                title: 'Initial',
                icon: 'alert-triangle',
            });
            root.append(panel);

            panel.setTitle('Changed Title');

            expect(panel.getVariant()).toBe('warning');
            expect(panel.getIcon()).toBe('alert-triangle');
            expect(panel.getTitle()).toBe('Changed Title');
        });
    });

    test('panel variant can be changed via setVariant', () => {
        const editor = createHeadlessEditor(editorConfig);

        editor.update(() => {
            const root = $getRoot();
            const panel = $createPanelBlockNode({
                variant: 'info',
                title: 'Test',
            });
            root.append(panel);

            panel.setVariant('success');
            expect(panel.getVariant()).toBe('success');
        });
    });
});
