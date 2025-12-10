import React from 'react';
import '../styles.css';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ClickableLinkPlugin } from './ClickableLinkPlugin';
import { PasteLinkPlugin } from './PasteLinkPlugin';
import { InlineToolbar } from './InlineToolbar';

interface LumiaInlineEditorPrimitiveProps {
  placeholder?: string;
  className?: string;
}

export function LumiaInlineEditorPrimitive({
  placeholder = 'Enter text...',
  className,
}: LumiaInlineEditorPrimitiveProps) {
  return (
    <div className={`editor-container relative ${className || ''}`}>
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className="editor-input inline-editor-input"
            aria-label="Rich Text Editor"
          />
        }
        placeholder={<div className="editor-placeholder">{placeholder}</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <LinkPlugin />
      <ClickableLinkPlugin />
      <PasteLinkPlugin />
      <InlineToolbar />
    </div>
  );
}
