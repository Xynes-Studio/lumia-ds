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
import { ImageBlockNode } from './nodes/ImageBlockNode';
import { FileBlockNode } from './nodes/FileBlockNode/FileBlockNode';
import {
  FontConfig,
  getDefaultFontConfig,
  normalizeFontConfig,
} from './font-config';
import { EditorMediaConfig, getEffectiveMediaConfig } from './media-config';

interface EditorContextType {
  editor: LexicalEditor | null;
  editorState: LumiaEditorStateJSON | null;
}

const EditorContext = createContext<EditorContextType>({
  editor: null,
  editorState: null,
});

export const useEditorContext = () => useContext(EditorContext);

// FontsContext to provide font configuration throughout the editor
export const FontsContext = createContext<FontConfig | null>(null);

// MediaContext to provide media configuration throughout the editor
export const MediaContext = createContext<EditorMediaConfig | null>(null);

export const useMediaContext = () => useContext(MediaContext);

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
  fonts?: FontConfig;
  media?: EditorMediaConfig;
}

export function EditorProvider({
  children,
  value,
  onChange,
  readOnly,
  theme = {},
  fonts,
  media,
}: EditorProviderProps) {
  // Use provided fonts config or default, then normalize
  const fontsConfig = useMemo(
    () => normalizeFontConfig(fonts || getDefaultFontConfig()),
    [fonts],
  );

  const mediaConfig = useMemo(() => getEffectiveMediaConfig(media), [media]);
  const [editor, setEditor] = useState<LexicalEditor | null>(null);
  const [editorState, setEditorState] = useState<LumiaEditorStateJSON | null>(
    value || null,
  );

  const initialConfig = {
    namespace: 'LumiaEditor',
    theme: {
      link: 'editor-link',
      code: 'editor-code',
      heading: {
        h1: 'editor-heading-h1',
        h2: 'editor-heading-h2',
        h3: 'editor-heading-h3',
      },
      codeHighlight: {
        atrule: 'editor-tokenAttr',
        attr: 'editor-tokenAttr',
        boolean: 'editor-tokenProperty',
        builtin: 'editor-tokenSelector',
        cdata: 'editor-tokenComment',
        char: 'editor-tokenSelector',
        class: 'editor-tokenFunction',
        'class-name': 'editor-tokenFunction',
        comment: 'editor-tokenComment',
        constant: 'editor-tokenProperty',
        deleted: 'editor-tokenProperty',
        doctype: 'editor-tokenComment',
        entity: 'editor-tokenOperator',
        function: 'editor-tokenFunction',
        important: 'editor-tokenVariable',
        inserted: 'editor-tokenSelector',
        keyword: 'editor-tokenAttr',
        namespace: 'editor-tokenVariable',
        number: 'editor-tokenProperty',
        operator: 'editor-tokenOperator',
        prolog: 'editor-tokenComment',
        property: 'editor-tokenProperty',
        punctuation: 'editor-tokenPunctuation',
        regex: 'editor-tokenVariable',
        selector: 'editor-tokenSelector',
        string: 'editor-tokenString',
        symbol: 'editor-tokenProperty',
        tag: 'editor-tokenProperty',
        url: 'editor-tokenOperator',
        variable: 'editor-tokenVariable',
      },
      list: {
        ul: 'editor-list-ul',
        ol: 'editor-list-ol',
        listitem: 'editor-listitem',
      },
      ...theme,
    },
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
      ImageBlockNode,
      FileBlockNode,
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
      <FontsContext.Provider value={fontsConfig}>
        <MediaContext.Provider value={mediaConfig}>
          <LexicalComposer initialConfig={initialConfig}>
            <InternalEditorContext.Provider value={internalContextValue}>
              <ContextUpdaterPlugin setEditor={setEditor} />
              <EditorStatePlugin onChange={onChange} />
              {children}
            </InternalEditorContext.Provider>
          </LexicalComposer>
        </MediaContext.Provider>
      </FontsContext.Provider>
    </EditorContext.Provider>
  );
}
