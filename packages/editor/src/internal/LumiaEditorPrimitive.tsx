import React, { useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { EditorState } from 'lexical';
import { LumiaEditorStateJSON } from '../types';

const theme = {
    // Theme styling goes here
    // For now we leave it empty as per requirements
};

function onError(error: Error) {
    console.error(error);
}

interface LumiaEditorPrimitiveProps {
    value: LumiaEditorStateJSON | null;
    onChange: (value: LumiaEditorStateJSON) => void;
    placeholder?: string;
    className?: string;
}

function InitialStatePlugin({ value }: { value: LumiaEditorStateJSON | null }) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (value) {
            const initialEditorState = editor.parseEditorState(value);
            editor.setEditorState(initialEditorState);
        }
        // We only want to initialize the editor state once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor]);

    return null;
}

export function LumiaEditorPrimitive({
    value,
    onChange,
    placeholder = 'Enter some text...',
    className,
}: LumiaEditorPrimitiveProps) {
    const initialConfig = {
        namespace: 'LumiaEditor',
        theme,
        onError,
        nodes: [
            HeadingNode,
            ListNode,
            ListItemNode,
            QuoteNode,
            CodeNode,
            CodeHighlightNode,
            TableNode,
            TableCellNode,
            TableRowNode,
            AutoLinkNode,
            LinkNode,
        ],
    };

    const handleChange = (editorState: EditorState) => {
        editorState.read(() => {
            const json = editorState.toJSON();
            onChange(json);
        });
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div className={`editor-container ${className || ''}`}>
                <RichTextPlugin
                    contentEditable={<ContentEditable className="editor-input" />}
                    placeholder={
                        <div className="editor-placeholder">{placeholder}</div>
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                />
                <HistoryPlugin />
                <OnChangePlugin onChange={handleChange} />
                <InitialStatePlugin value={value} />
            </div>
        </LexicalComposer>
    );
}
