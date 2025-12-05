import React from 'react';
import '../styles.css';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';

import { Toolbar } from './Toolbar';
import { ClickableLinkPlugin } from './ClickableLinkPlugin';
import { PasteLinkPlugin } from './PasteLinkPlugin';

interface LumiaEditorPrimitiveProps {
  placeholder?: string;
  className?: string;
}

export function LumiaEditorPrimitive({
  placeholder = 'Enter some text...',
  className,
}: LumiaEditorPrimitiveProps) {
  return (
    <div className={`editor-container ${className || ''}`}>
      <Toolbar />
      <RichTextPlugin
        contentEditable={<ContentEditable className="editor-input" />}
        placeholder={<div className="editor-placeholder">{placeholder}</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <ListPlugin />
      <LinkPlugin />
      <ClickableLinkPlugin />
      <PasteLinkPlugin />
    </div>
  );
}
