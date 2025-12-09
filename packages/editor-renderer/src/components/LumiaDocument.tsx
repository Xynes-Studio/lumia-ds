import React from 'react';
import { TextRenderer } from './renderers/TextRenderer';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LumiaEditorStateJSON, BlockDefinition } from '../types';
import { defaultBlockRegistry } from '../blockRegistry';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Minimal type for what we expect in a node
type LumiaNode = {
  type: string;
  children?: LumiaNode[];
  [key: string]: unknown;
};

export interface LumiaDocumentProps {
  value: LumiaEditorStateJSON;
  blockRegistry?: BlockDefinition[];
  className?: string;
}

export const LumiaDocument: React.FC<LumiaDocumentProps> = ({
  value,
  blockRegistry = [],
  className,
}) => {
  if (!value || !value.root) return null;

  // Merge default registry with provided registry
  // Provided registry overrides defaults if types match
  const mergedRegistry = new Map<string, BlockDefinition>();
  defaultBlockRegistry.forEach((def) => mergedRegistry.set(def.type, def));
  blockRegistry.forEach((def) => mergedRegistry.set(def.type, def));

  return (
    <div
      className={cn('lumia-document prose prose-slate max-w-none', className)}
    >
      {}
      <RenderChildren
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nodes={(value.root as any).children}
        registry={mergedRegistry}
      />
    </div>
  );
};

const RenderChildren = ({
  nodes,
  registry,
}: {
  nodes: LumiaNode[];
  registry: Map<string, BlockDefinition>;
}) => {
  if (!nodes) return null;
  return (
    <>
      {nodes.map((node: LumiaNode, i: number) => (
        <NodeRenderer
          key={(node.key as string) || i}
          node={node}
          registry={registry}
        />
      ))}
    </>
  );
};

const NodeRenderer = ({
  node,
  registry,
}: {
  node: LumiaNode;
  registry: Map<string, BlockDefinition>;
}) => {
  // Check if we have a custom component for this block type
  const blockDef = registry.get(node.type);
  if (blockDef && blockDef.component) {
    const Component = blockDef.component;

    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <Component node={node as any}>
        <RenderChildren nodes={node.children || []} registry={registry} />
      </Component>
    );
  }

  switch (node.type) {
    case 'text':
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return <TextRenderer node={node as any} />;

    // Core Elements
    case 'paragraph':
      return (
        <p
          className={cn(
            getAlignmentClass(node.format as string | number),
            'mb-2 leading-7',
          )}
          style={getIndentStyle(node.indent as number)}
        >
          <RenderChildren nodes={node.children || []} registry={registry} />
        </p>
      );

    case 'heading': {
      const Tag = (node.tag || 'h1') as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      // Adjust sizes roughly
      const sizes = {
        h1: 'text-4xl font-bold mt-8 mb-4',
        h2: 'text-3xl font-semibold mt-6 mb-3',
        h3: 'text-2xl font-semibold mt-5 mb-2',
        h4: 'text-xl font-semibold mt-4 mb-2',
        h5: 'text-lg font-medium mt-4 mb-2',
        h6: 'text-base font-medium mt-4 mb-2',
      };
      return (
        <Tag
          className={cn(
            sizes[Tag],
            getAlignmentClass(node.format as string | number),
          )}
          style={getIndentStyle(node.indent as number)}
        >
          <RenderChildren nodes={node.children || []} registry={registry} />
        </Tag>
      );
    }

    case 'quote':
      return (
        <blockquote className="border-l-4 border-gray-300 pl-4 py-1 my-4 italic text-gray-700 bg-gray-50/50">
          <RenderChildren nodes={node.children || []} registry={registry} />
        </blockquote>
      );

    case 'link':
      return (
        <a
          href={node.url as string}
          target={node.target as string}
          rel={node.rel as string}
          className="text-blue-600 hover:underline cursor-pointer"
        >
          <RenderChildren nodes={node.children || []} registry={registry} />
        </a>
      );

    case 'list': {
      const ListTag = node.listType === 'number' ? 'ol' : 'ul';
      const listStyle =
        node.listType === 'number' ? 'list-decimal' : 'list-disc';
      return (
        <ListTag className={cn('list-inside my-4 pl-4', listStyle)}>
          <RenderChildren nodes={node.children || []} registry={registry} />
        </ListTag>
      );
    }

    case 'listitem': {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isChecked = (node as any).checked;
      return (
        <li
          className={cn(
            'pl-1 my-1', // Spacing
            isChecked !== undefined ? 'list-none flex items-start gap-2' : '',
          )}
        >
          {isChecked !== undefined && (
            <input
              type="checkbox"
              checked={isChecked}
              readOnly
              className="mt-1"
            />
          )}
          <span className="flex-1 min-w-0">
            <RenderChildren nodes={node.children || []} registry={registry} />
          </span>
        </li>
      );
    }

    case 'code': {
      const lang = (node.language as string) || 'text';
      return (
        <div className="relative group my-4">
          <div className="absolute top-2 right-2 text-xs text-gray-500 font-mono opacity-50 group-hover:opacity-100 transition-opacity">
            {lang}
          </div>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono text-gray-800 border border-gray-200">
            <code>
              <RenderChildren nodes={node.children || []} registry={registry} />
            </code>
          </pre>
        </div>
      );
    }

    case 'table': {
      // Separate header rows from body rows
      const children = node.children || [];
      const headerRows: LumiaNode[] = [];
      const bodyRows: LumiaNode[] = [];

      children.forEach((row) => {
        // Check if row has any header cells
        const hasHeaderCell = row.children?.some(
          (cell) => cell.headerState === 1,
        );
        if (hasHeaderCell) {
          headerRows.push(row);
        } else {
          bodyRows.push(row);
        }
      });

      // If no explicit header rows found but maybe it's just the first row?
      // Lexical table usually marks header cells. If all cells in first row are headers, it's a header row.
      // We will stick to the logic: row containing header cells -> head, else -> body.
      // Wait, complex tables might have headers on left.
      // Standard simplified validation: If specific header rows exist, use them in thead.

      return (
        <div className="overflow-x-auto my-6 border rounded-lg">
          <table className="w-full border-collapse bg-white text-sm text-left">
            {headerRows.length > 0 && (
              <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
                <RenderChildren nodes={headerRows} registry={registry} />
              </thead>
            )}
            <tbody className="divide-y divide-gray-200">
              <RenderChildren nodes={bodyRows} registry={registry} />
            </tbody>
          </table>
        </div>
      );
    }
    case 'tablerow':
      return (
        <tr className="hover:bg-gray-50/50 transition-colors">
          <RenderChildren nodes={node.children || []} registry={registry} />
        </tr>
      );
    case 'tablecell': {
      const headerState = node.headerState as number;
      const CellTag = headerState === 1 ? 'th' : 'td';
      const isHeader = headerState > 0;
      return (
        <CellTag
          className={cn(
            'p-3 border-x border-gray-100 first:border-l-0 last:border-r-0',
            isHeader
              ? 'bg-gray-50 font-semibold text-gray-900'
              : 'text-gray-700',
          )}
          colSpan={node.colSpan as number}
          rowSpan={node.rowSpan as number}
        >
          <RenderChildren nodes={node.children || []} registry={registry} />
        </CellTag>
      );
    }

    default:
      if (node.children) {
        return (
          <div className="unknown-block my-2">
            <RenderChildren nodes={node.children || []} registry={registry} />
          </div>
        );
      }
      return null;
  }
};

function getAlignmentClass(format: string | number) {
  if (typeof format === 'string') {
    if (format === 'center') return 'text-center';
    if (format === 'right') return 'text-right';
    if (format === 'justify') return 'text-justify';
  }
  return '';
}

function getIndentStyle(indent: number) {
  if (indent > 0) return { paddingLeft: `${indent * 20}px` };
  return {};
}
