import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { EditorState, LexicalEditor } from 'lexical';
import { LumiaEditorStateJSON } from './types';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';

interface EditorContextType {
  editor: LexicalEditor | null;
  editorState: LumiaEditorStateJSON | null;
}

const EditorContext = createContext<EditorContextType>({
  editor: null,
  editorState: null,
});

export const useEditorContext = () => useContext(EditorContext);

function EditorStatePlugin({
  onChange,
}: {
  onChange?: (editorState: LumiaEditorStateJSON) => void;
}) {
  const [editor] = useLexicalComposerContext();
  const { setEditorState } = useInternalEditorContext();

  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      const json = editorState.toJSON();
      setEditorState(json);
      if (onChange) {
        onChange(json);
      }
    });
  };

  useEffect(() => {
    // Set initial editor instance
    // We can't easily set the editor instance in the parent context from here without a setter
    // So we'll rely on the parent component to handle the context provider,
    // but LexicalComposer is inside EditorProvider.
    // Actually, we can use a context *inside* LexicalComposer to expose the editor,
    // but we want EditorProvider to expose it.
  }, [editor]);

  return <OnChangePlugin onChange={handleChange} />;
}

// Internal context to update state from inside LexicalComposer
const InternalEditorContext = createContext<{
  setEditorState: (state: LumiaEditorStateJSON) => void;
}>({
  setEditorState: () => {},
});
const useInternalEditorContext = () => useContext(InternalEditorContext);

function ContextUpdaterPlugin({
  setEditor,
}: {
  setEditor: (editor: LexicalEditor) => void;
}) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    setEditor(editor);
  }, [editor, setEditor]);
  return null;
}

interface EditorProviderProps {
  children: React.ReactNode;
  value?: LumiaEditorStateJSON | null;
  onChange?: (value: LumiaEditorStateJSON) => void;
  readOnly?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  theme?: any;
}

export function EditorProvider({
  children,
  value,
  onChange,
  readOnly,
  theme = {},
}: EditorProviderProps) {
  const [editor, setEditor] = useState<LexicalEditor | null>(null);
  const [editorState, setEditorState] = useState<LumiaEditorStateJSON | null>(
    value || null,
  );

  const initialConfig = {
    namespace: 'LumiaEditor',
    theme,
    onError: (error: Error) => console.error(error),
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
    editorState: value ? JSON.stringify(value) : undefined,
    editable: !readOnly,
  };

  const contextValue = useMemo(
    () => ({
      editor,
      editorState,
    }),
    [editor, editorState],
  );

  const internalContextValue = useMemo(
    () => ({
      setEditorState,
    }),
    [],
  );

  return (
    <EditorContext.Provider value={contextValue}>
      <LexicalComposer initialConfig={initialConfig}>
        <InternalEditorContext.Provider value={internalContextValue}>
          <ContextUpdaterPlugin setEditor={setEditor} />
          <EditorStatePlugin onChange={onChange} />
          {children}
        </InternalEditorContext.Provider>
      </LexicalComposer>
    </EditorContext.Provider>
  );
}
