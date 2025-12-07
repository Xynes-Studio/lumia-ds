import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { InsertBlockMenu } from './InsertBlockMenu';
import * as registryModule from '../../blocks/registry';
import { BlockDefinition, BlockType } from '../../blocks/types';
import { Type } from 'lucide-react';
import { ParagraphNode } from 'lexical';

// Mock block definitions for testing
const createMockBlockDefinition = (
  type: BlockType,
  label: string,
  insertable = true,
  insertAction: 'command' | 'custom' = 'command',
): BlockDefinition => ({
  type,
  label,
  icon: Type,
  nodeClass: ParagraphNode,
  description: `${label} description`,
  keywords: [type],
  insertable,
  insertAction,
});

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  const initialConfig = {
    namespace: 'test-editor',
    onError: (error: Error) => console.error(error),
    nodes: [],
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={<ContentEditable className="editor" />}
        placeholder={<div />}
        ErrorBoundary={LexicalErrorBoundary}
      />
      {children}
    </LexicalComposer>
  );
}

describe('InsertBlockMenu', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render the Insert button with correct label', () => {
    render(
      <TestWrapper>
        <InsertBlockMenu />
      </TestWrapper>,
    );

    const button = screen.getByRole('button', { name: /insert block/i });
    expect(button).toBeDefined();
    expect(screen.getByText('Insert')).toBeDefined();
  });

  it('should have correct aria attributes for accessibility', () => {
    render(
      <TestWrapper>
        <InsertBlockMenu />
      </TestWrapper>,
    );

    const button = screen.getByRole('button', { name: /insert block/i });
    expect(button.getAttribute('aria-haspopup')).toBe('menu');
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('should call getInsertableBlocks when component renders', () => {
    const spy = vi.spyOn(registryModule, 'getInsertableBlocks');

    render(
      <TestWrapper>
        <InsertBlockMenu />
      </TestWrapper>,
    );

    // getInsertableBlocks should be called when component renders
    expect(spy).toHaveBeenCalled();
  });

  it('should use stubbed getInsertableBlocks correctly', () => {
    // Stub getInsertableBlocks to return fake entries
    const fakeBlocks: BlockDefinition[] = [
      createMockBlockDefinition('image', 'Fake Image Block'),
      createMockBlockDefinition('video', 'Fake Video Block'),
    ];

    const spy = vi
      .spyOn(registryModule, 'getInsertableBlocks')
      .mockReturnValue(fakeBlocks);

    render(
      <TestWrapper>
        <InsertBlockMenu />
      </TestWrapper>,
    );

    // Verify the spy was called (component uses the registry)
    expect(spy).toHaveBeenCalled();
    // Verify it returns our stubbed data
    expect(spy.mock.results[0].value).toEqual(fakeBlocks);
  });

  it('should render with custom className', () => {
    render(
      <TestWrapper>
        <InsertBlockMenu className="custom-class" />
      </TestWrapper>,
    );

    const button = screen.getByRole('button', { name: /insert block/i });
    expect(button.className).toContain('custom-class');
  });
});

describe('getInsertableBlocks', () => {
  it('should return only insertable blocks from registry', () => {
    const insertableBlocks = registryModule.getInsertableBlocks();

    // All returned blocks should have insertable: true
    insertableBlocks.forEach((block) => {
      expect(block.insertable).toBe(true);
    });
  });

  it('should return expected insertable block types', () => {
    const insertableBlocks = registryModule.getInsertableBlocks();
    const types = insertableBlocks.map((b) => b.type);

    // Expected insertable types based on registry
    expect(types).toContain('image');
    expect(types).toContain('video');
    expect(types).toContain('file');
    expect(types).toContain('table');
    expect(types).toContain('panel');
    expect(types).toContain('status');
  });

  it('should not return non-insertable blocks', () => {
    const insertableBlocks = registryModule.getInsertableBlocks();
    const types = insertableBlocks.map((b) => b.type);

    // Paragraph and heading are not insertable via menu
    expect(types).not.toContain('paragraph');
    expect(types).not.toContain('heading');
    expect(types).not.toContain('code');
  });

  it('should return at least one block with insertable: true', () => {
    const insertableBlocks = registryModule.getInsertableBlocks();
    expect(insertableBlocks.length).toBeGreaterThan(0);
  });
});
