import React from 'react';
import '../styles.css';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { CodeHighlightPlugin } from './CodeHighlightPlugin';

import { Toolbar } from './Toolbar';
import { ClickableLinkPlugin } from './ClickableLinkPlugin';
import { PasteLinkPlugin } from './PasteLinkPlugin';
import { InsertImagePlugin } from '../plugins/InsertImagePlugin';
import { InsertFilePlugin } from '../plugins/InsertFilePlugin';
import { InsertVideoPlugin } from '../plugins/InsertVideoPlugin';
import { AutoEmbedVideoPlugin } from '../plugins/AutoEmbedVideoPlugin';
import { SlashMenuPlugin } from '../plugins/SlashMenuPlugin';
import { TableActionMenuPlugin } from '../plugins/TableActionMenuPlugin';
import { InsertPanelPlugin } from '../plugins/InsertPanelPlugin';
import { InsertStatusPlugin } from '../plugins/InsertStatusPlugin';
import { PanelActionMenuPlugin } from '../plugins/PanelActionMenuPlugin';
import { PanelListPlugin } from '../plugins/PanelListPlugin';
import { SelectedBlockTrackerPlugin } from '../plugins/SelectedBlockTrackerPlugin';
import { DragDropPastePlugin } from '../plugins/DragDropPastePlugin';

import { EditorToolbarCompact } from './EditorToolbarCompact';

interface LumiaEditorPrimitiveProps {
  placeholder?: string;
  className?: string;
  variant?: 'full' | 'compact';
}

function EditorSurface({ placeholder }: { placeholder: string }) {
  const [editor] = useLexicalComposerContext();
  const [isFocused, setIsFocused] = React.useState(false);

  const focusEditor = (event: React.MouseEvent<HTMLDivElement>) => {
    const rawTarget = event.target;
    const target =
      rawTarget instanceof HTMLElement
        ? rawTarget
        : rawTarget instanceof Node
          ? rawTarget.parentElement
          : null;

    if (
      target?.closest(
        '[contenteditable="true"], button, input, textarea, select, a, [role="button"]',
      )
    ) {
      return;
    }

    event.preventDefault();
    editor.focus();
  };

  return (
    <div
      className={`editor-input-wrapper${isFocused ? ' editor-input-wrapper--focused' : ''}`}
      onMouseDown={focusEditor}
    >
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className="editor-input"
            aria-label="Rich Text Editor"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        }
        placeholder={<div className="editor-placeholder">{placeholder}</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
    </div>
  );
}

export function LumiaEditorPrimitive({
  placeholder = 'Enter some text...',
  className,
  variant = 'full',
}: LumiaEditorPrimitiveProps) {
  return (
    <div
      className={`editor-container editor-container--document ${className || ''}`}
    >
      {variant === 'compact' ? <EditorToolbarCompact /> : <Toolbar />}
      <EditorSurface placeholder={placeholder} />
      <HistoryPlugin />
      <ListPlugin />
      <TablePlugin />
      <TableActionMenuPlugin />
      <LinkPlugin />
      <ClickableLinkPlugin />
      <PasteLinkPlugin />
      <InsertImagePlugin />
      <InsertFilePlugin />

      <InsertVideoPlugin />
      <InsertPanelPlugin />
      <InsertStatusPlugin />
      <AutoEmbedVideoPlugin />
      <SlashMenuPlugin />
      <SelectedBlockTrackerPlugin />
      <DragDropPastePlugin />

      <PanelActionMenuPlugin />
      <PanelListPlugin />
      <CodeHighlightPlugin />
    </div>
  );
}
