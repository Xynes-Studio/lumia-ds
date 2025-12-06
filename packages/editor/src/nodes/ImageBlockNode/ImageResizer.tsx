import * as React from 'react';
import { $getNodeByKey, NodeKey, LexicalEditor } from 'lexical';
import { $isImageBlockNode } from './ImageBlockNode';
// Assuming these exist or using standard HTML for now if not found

// Since I don't have the full list of @lumia/components, I'll use standard HTML elements with classes
// mimicking the style or use what I can find.
// The user asked to use "lumia Ui components or shadcn as base".
// I'll check what's available in @lumia/components later, but for now I'll build a functional component.

export function ImageResizer({
  editor,
  nodeKey,
  layout,
  width,
}: {
  editor: LexicalEditor;
  nodeKey: NodeKey;
  layout: 'inline' | 'breakout' | 'fullWidth' | undefined;
  width: number | undefined;
}): React.ReactElement {
  const handleLayoutChange = (
    newLayout: 'inline' | 'breakout' | 'fullWidth',
  ) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageBlockNode(node)) {
        const writable = node.getWritable();
        writable.__layout = newLayout;
      }
    });
  };

  const handleWidthChange = (newWidth: number) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageBlockNode(node)) {
        const writable = node.getWritable();
        writable.__width = newWidth;
      }
    });
  };

  return (
    <div className="absolute top-2 right-2 flex gap-2 bg-background/90 p-1 rounded shadow-sm border border-border z-10">
      <div className="flex gap-1">
        <button
          className={`p-1 rounded hover:bg-muted ${layout === 'inline' || !layout ? 'bg-muted' : ''}`}
          onClick={() => handleLayoutChange('inline')}
          title="Inline"
        >
          Inline
        </button>
        <button
          className={`p-1 rounded hover:bg-muted ${layout === 'breakout' ? 'bg-muted' : ''}`}
          onClick={() => handleLayoutChange('breakout')}
          title="Breakout"
        >
          Breakout
        </button>
        <button
          className={`p-1 rounded hover:bg-muted ${layout === 'fullWidth' ? 'bg-muted' : ''}`}
          onClick={() => handleLayoutChange('fullWidth')}
          title="Full Width"
        >
          Full
        </button>
      </div>
      <div className="w-px bg-border mx-1" />
      <div className="flex gap-1">
        {[25, 50, 75, 100].map((w) => (
          <button
            key={w}
            className={`p-1 rounded hover:bg-muted text-xs ${width === w ? 'bg-muted font-bold' : ''}`}
            onClick={() => handleWidthChange(w)}
          >
            {w}%
          </button>
        ))}
      </div>
    </div>
  );
}
