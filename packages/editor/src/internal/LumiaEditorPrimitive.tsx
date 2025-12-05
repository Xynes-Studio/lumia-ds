import React from 'react';
import '../styles.css';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { CodeHighlightPlugin } from './CodeHighlightPlugin';

import { Toolbar } from './Toolbar';
import { ClickableLinkPlugin } from './ClickableLinkPlugin';
import { PasteLinkPlugin } from './PasteLinkPlugin';
import { InsertImagePlugin } from '../plugins/InsertImagePlugin';

import { EditorToolbarCompact } from './EditorToolbarCompact';

interface LumiaEditorPrimitiveProps {
  placeholder?: string;
  className?: string;
  variant?: 'full' | 'compact';
}

export function LumiaEditorPrimitive({
  placeholder = 'Enter some text...',
  className,
  variant = 'full',
}: LumiaEditorPrimitiveProps) {
  return (
    <div className={`editor-container ${className || ''}`}>
      {variant === 'compact' ? <EditorToolbarCompact /> : <Toolbar />}
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className="editor-input"
            aria-label="Rich Text Editor"
          />
        }
        placeholder={<div className="editor-placeholder">{placeholder}</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <ListPlugin />
      <LinkPlugin />
      <ClickableLinkPlugin />
      <PasteLinkPlugin />
      <InsertImagePlugin />
      <CodeHighlightPlugin />
    </div>
  );
}
