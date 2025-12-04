import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EditorToolbar, EditorToolbarGroup } from './editor-toolbar';

describe('EditorToolbar', () => {
  it('renders children correctly', () => {
    render(
      <EditorToolbar data-testid="toolbar">
        <div>Child 1</div>
        <div>Child 2</div>
      </EditorToolbar>,
    );
    const toolbar = screen.getByTestId('toolbar');
    expect(toolbar).toBeInTheDocument();
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('renders with custom class name', () => {
    render(
      <EditorToolbar className="custom-class" data-testid="toolbar">
        Content
      </EditorToolbar>,
    );
    const toolbar = screen.getByTestId('toolbar');
    expect(toolbar).toHaveClass('custom-class');
  });
  it('renders with wrapping enabled', () => {
    render(
      <EditorToolbar data-testid="toolbar-wrap">
        <div>Content</div>
      </EditorToolbar>,
    );
    const toolbar = screen.getByTestId('toolbar-wrap');
    expect(toolbar).toHaveClass('flex-wrap');
  });
});

describe('EditorToolbarGroup', () => {
  it('renders children correctly', () => {
    render(
      <EditorToolbarGroup data-testid="group">
        <button>Bold</button>
      </EditorToolbarGroup>,
    );
    const group = screen.getByTestId('group');
    expect(group).toBeInTheDocument();
    expect(screen.getByText('Bold')).toBeInTheDocument();
  });

  it('applies alignment classes', () => {
    render(
      <EditorToolbarGroup align="end" data-testid="group-end">
        Right
      </EditorToolbarGroup>,
    );
    const groupEnd = screen.getByTestId('group-end');
    expect(groupEnd).toHaveClass('ml-auto');
  });
});
