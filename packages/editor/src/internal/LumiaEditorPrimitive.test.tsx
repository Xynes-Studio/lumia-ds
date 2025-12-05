import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { composeStories } from '@storybook/react';
import * as stories from './LumiaEditorPrimitive.stories';
import { LumiaEditorPrimitive } from './LumiaEditorPrimitive';
import { createHeadlessEditor } from '@lexical/headless';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';

const { JsonInOut } = composeStories(stories);

describe('LumiaEditorPrimitive', () => {
    it('renders without crashing', () => {
        render(<JsonInOut />);
        expect(screen.getByText('Type here to see JSON update...')).toBeInTheDocument();
    });

    it.skip('updates JSON when typing', async () => {
        const user = userEvent.setup();
        render(<JsonInOut />);
        const textboxes = screen.getAllByRole('textbox');
        const editorInput = textboxes[0]; // The editor is the first one
        const jsonOutput = textboxes[1]; // The textarea is the second one

        await user.type(editorInput, 'Hello World');

        // We expect the JSON to contain "Hello World"
        await waitFor(() => {
            expect(jsonOutput).toHaveValue(expect.stringContaining('Hello World'));
        });
    });

    it('calls onChange with correct JSON structure', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(
            <LumiaEditorPrimitive
                value={null}
                onChange={onChange}
                placeholder="Test placeholder"
            />
        );

        const editorInput = screen.getByRole('textbox');
        await user.type(editorInput, 'A');

        await waitFor(() => {
            expect(onChange).toHaveBeenCalled();
            const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
            expect(lastCall).toHaveProperty('root');
            expect(lastCall.root).toHaveProperty('children');
        });
    });

    it('loads initial value correctly', async () => {
        // Let's manually construct a simple valid JSON for "Hello"
        const initialJSON = {
            root: {
                children: [
                    {
                        children: [
                            {
                                detail: 0,
                                format: 0,
                                mode: 'normal',
                                style: '',
                                text: 'Initial Content',
                                type: 'text',
                                version: 1,
                            },
                        ],
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

        const onChange = vi.fn();
        render(
            <LumiaEditorPrimitive
                value={initialJSON as any}
                onChange={onChange}
                placeholder="Test placeholder"
            />
        );

        expect(screen.getByText('Initial Content')).toBeInTheDocument();
    });
});
