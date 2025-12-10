import { render, screen } from '@testing-library/react';
import { LumiaDocument } from './components/LumiaDocument';
import { describe, it, expect, vi } from 'vitest';
import mixedBlocksParams from './fixtures/mixed-blocks.json';
import React from 'react';

// Mock the complex block components to avoid needing their full implementation/dependencies in test
// We just want to check if the mapping works
vi.mock('./components/renderers/blocks/ImageBlock', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ImageBlock: ({ node }: { node: any }) => (
    <div data-testid="image-block" data-src={node.src}>
      {node.altText}
    </div>
  ),
}));
vi.mock('./components/renderers/blocks/PanelBlock', () => ({
  PanelBlock: ({
    node,
    children,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    node: any;
    children: React.ReactNode;
  }) => (
    <div data-testid="panel-block" className={`panel-${node.panelType}`}>
      {children}
    </div>
  ),
}));
vi.mock('./components/renderers/blocks/VideoBlock', () => ({
  VideoBlock: () => <div data-testid="video-block" />,
}));
vi.mock('./components/renderers/blocks/FileBlock', () => ({
  FileBlock: () => <div data-testid="file-block" />,
}));
vi.mock('./components/renderers/blocks/StatusBlock', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  StatusBlock: ({ node }: { node: any }) => (
    <div data-testid="status-block">{node.label}</div>
  ),
}));

describe('LumiaDocument Integration', () => {
  it('renders mixed blocks correctly from JSON fixture', () => {
    const { container } = render(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <LumiaDocument value={mixedBlocksParams as any} />,
    );

    // Check Core Blocks
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Welcome to Lumia Editor',
    );
    expect(
      screen.getByText(/This is a paragraph with some/),
    ).toBeInTheDocument();
    expect(screen.getByText('bold text')).toBeInTheDocument();

    // Check Custom Blocks via Registry Mapping
    const image = screen.getByTestId('image-block');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('data-src', 'https://placehold.co/600x400');
    expect(image).toHaveTextContent('Placeholder Image');

    const panel = screen.getByTestId('panel-block');
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveClass('panel-info');
    expect(panel).toHaveTextContent('This is an info panel.');

    const status = screen.getByTestId('status-block');
    expect(status).toHaveTextContent('Done');

    // Check Table Structure
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    // Check thead existence and content
    const thead = container.querySelector('thead');
    expect(thead).toBeInTheDocument();
    expect(thead).toHaveTextContent('Header 1');
    expect(thead).toHaveTextContent('Header 2');

    // Check tbody existence and content
    const tbody = container.querySelector('tbody');
    expect(tbody).toBeInTheDocument();
    expect(tbody).toHaveTextContent('Cell 1');
    expect(tbody).toHaveTextContent('Cell 2');
  });
});
