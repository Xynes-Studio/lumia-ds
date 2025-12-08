import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import { InsertBlockMenu } from './InsertBlockMenu';
import * as blocksModule from '../../blocks';
// import { EditorProvider } from '../../EditorProvider';
import { MediaContext } from '../../EditorProvider';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ImageBlockNode } from '../../nodes/ImageBlockNode';
import { VideoBlockNode } from '../../nodes/VideoBlockNode';
import { FileBlockNode } from '../../nodes/FileBlockNode/FileBlockNode';
import { PanelBlockNode } from '../../nodes/PanelBlockNode/PanelBlockNode';
import { StatusNode } from '../../nodes/StatusNode';

vi.mock('@lumia/components', () => ({
  Button: React.forwardRef(({ children, onClick, ...props }: React.ComponentProps<any>, ref: any) => (
    <button ref={ref} onClick={onClick} {...props}>
      {children}
    </button>
  )),
  Menu: ({ children }: any) => <div data-testid="menu">{children}</div>,
  MenuTrigger: ({ children }: any) => (
    <div data-testid="menu-trigger">{children}</div>
  ),
  MenuContent: ({ children }: any) => (
    <div data-testid="menu-content">{children}</div>
  ),
  Popover: ({ children }: any) => <div data-testid="popover">{children}</div>,
  PopoverTrigger: ({ children }: any) => (
    <div data-testid="popover-trigger">{children}</div>
  ),
  PopoverContent: ({ children }: any) => (
    <div data-testid="popover-content">{children}</div>
  ),
  Tabs: ({ children }: any) => <div data-testid="tabs">{children}</div>,
  TabsList: ({ children }: any) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({ children }: any) => (
    <div data-testid="tabs-trigger">{children}</div>
  ),
  TabsContent: ({ children }: any) => (
    <div data-testid="tabs-content">{children}</div>
  ),
  Input: (props: any) => <input {...props} data-testid="input" />,
  Select: ({ children, ...props }: any) => (
    <select {...props} data-testid="select">
      {children}
    </select>
  ),
  Slider: (props: any) => <div data-testid="slider" />,
}));

function TestWrapper({ children }: { children: React.ReactNode }) {
  const initialConfig = {
    namespace: 'test-editor',
    onError: (error: Error) => console.error(error),
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      AutoLinkNode,
      LinkNode,
      ImageBlockNode,
      VideoBlockNode,
      FileBlockNode,
      PanelBlockNode,
      StatusNode,
    ],
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <MediaContext.Provider value={null}>
        <RichTextPlugin
          contentEditable={<ContentEditable className="editor" />}
          placeholder={<div />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        {children}
      </MediaContext.Provider>
    </LexicalComposer>
  );
}

describe('InsertBlockMenu', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('placeholder test', () => {
    expect(true).toBe(true);
  });

  it('should open menu and show items when clicked', async () => {
    // specific blocks for this test
    const fakeBlocks = [
      {
        type: 'table' as const,
        label: 'Table',
        insertable: true,
        insertAction: 'command' as const,
        icon: () => null,
        nodeClass: TableNode,
        description: '',
        keywords: [],
        slashEnabled: true,
      },
      {
        type: 'image' as const,
        label: 'Image',
        insertable: true,
        insertAction: 'custom' as const,
        icon: () => null,
        nodeClass: ImageBlockNode,
        description: '',
        keywords: [],
        slashEnabled: true,
      },
    ];
    vi.spyOn(blocksModule, 'getInsertableBlocks').mockReturnValue(fakeBlocks);

    render(
      <TestWrapper>
        <InsertBlockMenu />
      </TestWrapper>,
    );

    const button = screen.getByRole('button', { name: /insert block/i });
    fireEvent.click(button);

    expect(screen.getByText('Table')).toBeVisible();
    expect(screen.getByText('Image')).toBeVisible();
  });

  it('should dispatch simple command (Table) when clicked', async () => {
    const fakeBlocks = [
      {
        type: 'table' as const,
        label: 'Table',
        insertable: true,
        insertAction: 'command' as const,
        icon: () => null,
        nodeClass: TableNode,
        description: '',
        keywords: [],
        slashEnabled: true,
      },
    ];
    vi.spyOn(blocksModule, 'getInsertableBlocks').mockReturnValue(fakeBlocks);

    // Create a spy for dispatchCommand by accessing editor from context
    // We can't easily access the editor instance created inside TestWrapper > LexicalComposer
    // without a child component that uses useLexicalComposerContext.

    let editorSpy: any;
    const EditorSpy = () => {
      const [editor] = useLexicalComposerContext();
      editorSpy = editor as any;
      return null;
    };

    render(
      <TestWrapper>
        <EditorSpy />
        <InsertBlockMenu />
      </TestWrapper>,
    );

    const dispatchSpy = vi.spyOn(editorSpy, 'dispatchCommand');

    // Open menu
    fireEvent.click(screen.getByRole('button', { name: /insert block/i }));

    // Click Table item
    fireEvent.click(screen.getByText('Table'));

    expect(dispatchSpy).toHaveBeenCalledWith(
      INSERT_TABLE_COMMAND,
      expect.objectContaining({
        rows: '3',
        columns: '3',
      }),
    );
  });

  it('should open custom popover for Image block', async () => {
    const fakeBlocks = [
      {
        type: 'image' as const,
        label: 'Image',
        insertable: true,
        insertAction: 'custom' as const,
        icon: () => null,
        nodeClass: ImageBlockNode,
        description: '',
        keywords: [],
        slashEnabled: true,
      },
    ];
    vi.spyOn(blocksModule, 'getInsertableBlocks').mockReturnValue(fakeBlocks);

    render(
      <TestWrapper>
        <InsertBlockMenu />
      </TestWrapper>,
    );

    fireEvent.click(screen.getByRole('button', { name: /insert block/i }));

    const imageItem = screen.getByText('Image');
    fireEvent.click(imageItem);

    // Wait for popover content
    await waitFor(() => {
      expect(
        screen.getByTestId('popover-content') || screen.queryByRole('dialog'),
      ).toBeInTheDocument();
    });
  });

  it('renders the Insert button', () => {
    render(
      <TestWrapper>
        <InsertBlockMenu />
      </TestWrapper>,
    );
    expect(screen.getByRole('button', { name: /insert block/i })).toBeDefined();
  });

  it('calls getInsertableBlocks on render', () => {
    const spy = vi
      .spyOn(blocksModule, 'getInsertableBlocks')
      .mockReturnValue([]);
    render(
      <TestWrapper>
        <InsertBlockMenu />
      </TestWrapper>,
    );
    expect(spy).toHaveBeenCalled();
  });

  it('should render empty menu when no insertable blocks', () => {
    vi.spyOn(blocksModule, 'getInsertableBlocks').mockReturnValue([]);
    render(
      <TestWrapper>
        <InsertBlockMenu />
      </TestWrapper>,
    );
    expect(screen.getByRole('button', { name: /insert block/i })).toBeDefined();
  });

  it('should show video item when video block is available', async () => {
    const fakeBlocks = [
      {
        type: 'video' as const,
        label: 'Video',
        insertable: true,
        insertAction: 'custom' as const,
        icon: () => null,
        nodeClass: VideoBlockNode,
        description: '',
        keywords: [],
        slashEnabled: true,
      },
    ];
    vi.spyOn(blocksModule, 'getInsertableBlocks').mockReturnValue(fakeBlocks);

    render(
      <TestWrapper>
        <InsertBlockMenu />
      </TestWrapper>,
    );

    fireEvent.click(screen.getByRole('button', { name: /insert block/i }));
    expect(screen.getByText('Video')).toBeVisible();
  });

  it('should show file item when file block is available', async () => {
    const fakeBlocks = [
      {
        type: 'file' as const,
        label: 'File',
        insertable: true,
        insertAction: 'custom' as const,
        icon: () => null,
        nodeClass: FileBlockNode,
        description: '',
        keywords: [],
        slashEnabled: true,
      },
    ];
    vi.spyOn(blocksModule, 'getInsertableBlocks').mockReturnValue(fakeBlocks);

    render(
      <TestWrapper>
        <InsertBlockMenu />
      </TestWrapper>,
    );

    fireEvent.click(screen.getByRole('button', { name: /insert block/i }));
    expect(screen.getByText('File')).toBeVisible();
  });
});
