import React, { useState, useRef } from 'react';
import { DocNode, TextNode, Heading } from '../schema/docSchema';
import { LumiaEditor } from '../lumia-editor/lumia-editor';

export interface LumiaInlineEditorProps {
  value: DocNode;
  onChange: (value: DocNode) => void;
  placeholder?: string;
  className?: string;
}

export const LumiaInlineEditor = ({
  value,
  onChange,
  placeholder = 'Click to edit...',
  className,
}: LumiaInlineEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleBlur = (e: React.FocusEvent) => {
    // Check if the new focus is still within the editor container
    if (
      containerRef.current &&
      containerRef.current.contains(e.relatedTarget as Node)
    ) {
      return;
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Exit editing mode on Escape key
    if (e.key === 'Escape') {
      setIsEditing(false);
      // Return focus to the view mode element
      if (containerRef.current) {
        const viewElement = containerRef.current.querySelector(
          '[data-testid="lumia-inline-editor-view-mode"]',
        ) as HTMLElement;
        viewElement?.focus();
      }
    }
  };

  const renderContent = (node: DocNode, key?: React.Key): React.ReactNode => {
    if (node.type === 'text') {
      return <span key={key}>{(node as TextNode).text}</span>;
    }

    if ('content' in node && node.content) {
      const children = node.content.map((child, index) =>
        renderContent(child, index),
      );

      if (node.type === 'paragraph') {
        return (
          <p key={key} className="mb-2">
            {children}
          </p>
        );
      }

      if (node.type === 'heading') {
        const level = (node as Heading).attrs.level;
        const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
        const sizes = {
          1: 'text-4xl font-bold mb-4',
          2: 'text-3xl font-bold mb-3',
          3: 'text-2xl font-bold mb-2',
          4: 'text-xl font-bold mb-2',
          5: 'text-lg font-bold mb-1',
          6: 'text-base font-bold mb-1',
        };
        return (
          <Tag key={key} className={sizes[level as keyof typeof sizes]}>
            {children}
          </Tag>
        );
      }

      if (node.type === 'doc') {
        // Check if doc is empty
        if (children.length === 0 || (children.length === 1 && !children[0])) {
          return <span className="text-gray-400 italic">{placeholder}</span>;
        }
        return <React.Fragment key={key}>{children}</React.Fragment>;
      }

      // Fallback for other nodes
      return <div key={key}>{children}</div>;
    }
    return null;
  };

  if (isEditing) {
    return (
      <div
        ref={containerRef}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`lumia-inline-editor-wrapper ${className || ''}`}
        data-testid="lumia-inline-editor-edit-mode"
        role="textbox"
        aria-label="Inline editor"
      >
        <LumiaEditor
          value={value}
          onChange={onChange}
          variant="compact"
          className="border rounded shadow-sm bg-white"
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onClick={() => setIsEditing(true)}
      className={`lumia-inline-editor-view cursor-text hover:bg-gray-50 p-1 rounded -m-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
        className || ''
      }`}
      data-testid="lumia-inline-editor-view-mode"
      tabIndex={0}
      onFocus={() => setIsEditing(true)}
      role="button"
      aria-label="Click to edit text"
    >
      {renderContent(value)}
    </div>
  );
};
