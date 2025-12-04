import React, { useEffect, useState } from 'react';
import { DocNode } from '../schema/docSchema';
// import { editorStateToJson, jsonToEditorState } from '../core/transforms';

export interface LumiaEditorProps {
  value: DocNode;
  onChange: (value: DocNode) => void;
  readOnly?: boolean;
  variant?: 'full' | 'compact';
  className?: string;
}

export const LumiaEditor = ({
  value,
  onChange,
  readOnly = false,
  variant = 'full',
  className,
}: LumiaEditorProps) => {
  // Mock internal state for now since we don't have the full engine runtime
  const [internalValue, setInternalValue] = useState<string>(
    JSON.stringify(value, null, 2),
  );

  useEffect(() => {
    setInternalValue(JSON.stringify(value, null, 2));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);

    try {
      // Try to parse back to JSON to simulate engine update
      const parsed = JSON.parse(newValue);
      onChange(parsed);
    } catch (error) {
      // Ignore parse errors for this mock implementation
      console.warn('Failed to parse editor content', error);
    }
  };

  return (
    <div className={`lumia-editor ${className || ''} ${variant}`}>
      {/* Placeholder for Toolbar */}
      {!readOnly && (
        <div className="lumia-editor-toolbar-placeholder p-2 border-b">
          Toolbar
        </div>
      )}

      <div className="lumia-editor-content p-4">
        {readOnly ? (
          <pre
            className="whitespace-pre-wrap"
            data-testid="lumia-editor-readonly-view"
          >
            {internalValue}
          </pre>
        ) : (
          <textarea
            className="w-full h-64 p-2 border rounded"
            value={internalValue}
            onChange={handleChange}
            readOnly={readOnly}
            data-testid="lumia-editor-input"
          />
        )}
      </div>
    </div>
  );
};
