import React from 'react';
import '../styles.css';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ClickableLinkPlugin } from './ClickableLinkPlugin';
import { PasteLinkPlugin } from './PasteLinkPlugin';
import { InlineToolbar } from './InlineToolbar';

interface LumiaInlineEditorPrimitiveProps {
  placeholder?: string;
  className?: string;
}

function InlineEditorSurface({ placeholder }: { placeholder: string }) {
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
            className="editor-input inline-editor-input"
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

export function LumiaInlineEditorPrimitive({
  placeholder = 'Enter text...',
  className,
}: LumiaInlineEditorPrimitiveProps) {
  return (
    <div
      className={`editor-container editor-container--inline relative ${className || ''}`}
    >
      <InlineEditorSurface placeholder={placeholder} />
      <HistoryPlugin />
      <LinkPlugin />
      <ClickableLinkPlugin />
      <PasteLinkPlugin />
      <InlineToolbar />
    </div>
  );
}
