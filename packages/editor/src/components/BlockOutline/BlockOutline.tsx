import React from 'react';
import { useEditorContext } from '../../EditorProvider';
import { useBlockOutline } from '../../hooks/useBlockOutline';
import { getBlockDefinition } from '../../blocks/registry';
import { BlockType } from '../../blocks/types';
import { $getNodeByKey, $isElementNode, ElementNode } from 'lexical';

export const BlockOutline = () => {
  const { editor, selectedBlock } = useEditorContext();
  const blocks = useBlockOutline();

  if (!editor) return null;

  const handleBlockClick = (key: string) => {
    editor.update(() => {
      const node = $getNodeByKey(key);
      if (node) {
        // Select the node
        if ($isElementNode(node)) {
          (node as ElementNode).selectStart();
        } else {
          (node as any).select();
        }
      }
    });

    // Scroll into view
    // We need to do this after the update or immediately if the DOM is already there.
    // getElementByKey returns the DOM element.
    const element = editor.getElementByKey(key);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (blocks.length === 0) {
    return <div className="text-sm text-gray-500 p-4">No blocks found.</div>;
  }

  return (
    <div className="flex flex-col gap-1 w-64 border-r border-gray-200 h-full overflow-y-auto p-2 bg-gray-50/50">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
        Outline
      </h3>
      {blocks.map((block) => {
        const def = getBlockDefinition(block.type as BlockType);
        const Icon = def?.icon as React.ElementType<{ className?: string }>;
        const isActive = selectedBlock?.nodeKey === block.id;

        return (
          <button
            key={block.id}
            onClick={() => handleBlockClick(block.id)}
            className={`
              group flex items - center gap - 2 px - 2 py - 1.5 w - full text - left rounded - md text - sm transition - colors
              ${isActive
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
              }
`}
          >
            {Icon && (
              <Icon
                className={`w - 4 h - 4 ${isActive
                  ? 'text-blue-500'
                  : 'text-gray-400 group-hover:text-gray-500'
                  } `}
              />
            )}
            <span className="truncate flex-1">{block.label}</span>
          </button>
        );
      })}
    </div>
  );
};
