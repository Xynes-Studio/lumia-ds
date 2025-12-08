/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { LumiaEditorPrimitive } from './LumiaEditorPrimitive';
import { vi, describe, it, expect } from 'vitest';

// Mock all child plugins and components to verify they are rendered
vi.mock('@lexical/react/LexicalRichTextPlugin', () => ({
  RichTextPlugin: ({ placeholder, contentEditable }: any) => (
    <div data-testid="rich-text-plugin">
      {contentEditable}
      {placeholder}
    </div>
  ),
}));

vi.mock('@lexical/react/LexicalContentEditable', () => ({
  ContentEditable: ({ className, 'aria-label': ariaLabel }: any) => (
    <div
      data-testid="content-editable"
      className={className}
      aria-label={ariaLabel}
    />
  ),
}));

vi.mock('@lexical/react/LexicalHistoryPlugin', () => ({
  HistoryPlugin: () => <div data-testid="history-plugin" />,
}));

vi.mock('@lexical/react/LexicalListPlugin', () => ({
  ListPlugin: () => <div data-testid="list-plugin" />,
}));

vi.mock('@lexical/react/LexicalLinkPlugin', () => ({
  LinkPlugin: () => <div data-testid="link-plugin" />,
}));

vi.mock('@lexical/react/LexicalTablePlugin', () => ({
  TablePlugin: () => <div data-testid="table-plugin" />,
}));

vi.mock('./CodeHighlightPlugin', () => ({
  CodeHighlightPlugin: () => <div data-testid="code-highlight-plugin" />,
}));

vi.mock('./Toolbar', () => ({
  Toolbar: () => <div data-testid="toolbar" />,
}));

vi.mock('./EditorToolbarCompact', () => ({
  EditorToolbarCompact: () => <div data-testid="editor-toolbar-compact" />,
}));

vi.mock('./ClickableLinkPlugin', () => ({
  ClickableLinkPlugin: () => <div data-testid="clickable-link-plugin" />,
}));

vi.mock('./PasteLinkPlugin', () => ({
  PasteLinkPlugin: () => <div data-testid="paste-link-plugin" />,
}));

vi.mock('../plugins/InsertImagePlugin', () => ({
  InsertImagePlugin: () => <div data-testid="insert-image-plugin" />,
}));

vi.mock('../plugins/InsertFilePlugin', () => ({
  InsertFilePlugin: () => <div data-testid="insert-file-plugin" />,
}));

vi.mock('../plugins/InsertVideoPlugin', () => ({
  InsertVideoPlugin: () => <div data-testid="insert-video-plugin" />,
}));

vi.mock('../plugins/AutoEmbedVideoPlugin', () => ({
  AutoEmbedVideoPlugin: () => <div data-testid="auto-embed-video-plugin" />,
}));

vi.mock('../plugins/SlashMenuPlugin', () => ({
  SlashMenuPlugin: () => <div data-testid="slash-menu-plugin" />,
}));

vi.mock('../plugins/TableActionMenuPlugin', () => ({
  TableActionMenuPlugin: () => <div data-testid="table-action-menu-plugin" />,
}));

vi.mock('../plugins/InsertPanelPlugin', () => ({
  InsertPanelPlugin: () => <div data-testid="insert-panel-plugin" />,
}));

vi.mock('../plugins/InsertStatusPlugin', () => ({
  InsertStatusPlugin: () => <div data-testid="insert-status-plugin" />,
}));

vi.mock('../plugins/PanelActionMenuPlugin', () => ({
  PanelActionMenuPlugin: () => <div data-testid="panel-action-menu-plugin" />,
}));

vi.mock('../plugins/PanelListPlugin', () => ({
  PanelListPlugin: () => <div data-testid="panel-list-plugin" />,
}));

vi.mock('../plugins/SelectedBlockTrackerPlugin', () => ({
  SelectedBlockTrackerPlugin: () => (
    <div data-testid="selected-block-tracker-plugin" />
  ),
}));

vi.mock('../plugins/DragDropPastePlugin', () => ({
  DragDropPastePlugin: () => <div data-testid="drag-drop-paste-plugin" />,
}));

describe('LumiaEditorPrimitive', () => {
  it('renders full editor variant by default', () => {
    render(<LumiaEditorPrimitive />);

    expect(screen.getByTestId('toolbar')).toBeInTheDocument();
    expect(
      screen.queryByTestId('editor-toolbar-compact'),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('rich-text-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('content-editable')).toBeInTheDocument();
    expect(screen.getByText('Enter some text...')).toBeInTheDocument();
  });

  it('renders compact editor variant', () => {
    render(<LumiaEditorPrimitive variant="compact" />);

    expect(screen.queryByTestId('toolbar')).not.toBeInTheDocument();
    expect(screen.getByTestId('editor-toolbar-compact')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(<LumiaEditorPrimitive placeholder="Custom placeholder" />);

    expect(screen.getByText('Custom placeholder')).toBeInTheDocument();
  });

  it('renders with custom class name', () => {
    const { container } = render(
      <LumiaEditorPrimitive className="custom-class" />,
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders all core plugins', () => {
    render(<LumiaEditorPrimitive />);

    expect(screen.getByTestId('history-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('list-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('table-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('link-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('clickable-link-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('paste-link-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('code-highlight-plugin')).toBeInTheDocument();
  });

  it('renders all feature plugins', () => {
    render(<LumiaEditorPrimitive />);

    expect(screen.getByTestId('insert-image-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('insert-file-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('insert-video-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('insert-panel-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('insert-status-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('auto-embed-video-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('slash-menu-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('table-action-menu-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('panel-action-menu-plugin')).toBeInTheDocument();
    expect(screen.getByTestId('panel-list-plugin')).toBeInTheDocument();
    expect(
      screen.getByTestId('selected-block-tracker-plugin'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('drag-drop-paste-plugin')).toBeInTheDocument();
  });
});
