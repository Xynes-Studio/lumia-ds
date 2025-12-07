import { render, screen } from '@testing-library/react';
import { LumiaDocument } from './components/LumiaDocument';
import { describe, it, expect, vi } from 'vitest';
import compatibilityFixture from './fixtures/compatibility-suite.json';
import React from 'react';

// Mock complex block components for purely mapping/renderer verification
vi.mock('./components/renderers/blocks/ImageBlock', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ImageBlock: ({ node }: { node: any }) => (
    <div data-testid="image-block" data-src={node.src} data-alt={node.alt}>
      {node.alt}
    </div>
  ),
}));

vi.mock('./components/renderers/blocks/VideoBlock', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  VideoBlock: ({ node }: { node: any }) => (
    <div
      data-testid="video-block"
      data-provider={node.provider}
      data-title={node.title}
    >
      {node.title}
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
    <div data-testid="panel-block" data-variant={node.variant}>
      {children}
    </div>
  ),
}));

vi.mock('./components/renderers/blocks/StatusBlock', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  StatusBlock: ({ node }: { node: any }) => (
    <div data-testid="status-block" data-status={node.color}>
      {node.text}
    </div>
  ),
}));

// Shared map of required block types that must appear in the test
const REQUIRED_BLOCK_SELECTORS = [
  {
    name: 'Paragraph',
    selector: () => screen.getByText(/This document tests the compatibility/),
  },
  {
    name: 'Heading Level 1',
    selector: () => screen.getByRole('heading', { level: 1 }),
  },
  { name: 'Image', selector: () => screen.getByTestId('image-block') },
  { name: 'Video', selector: () => screen.getByTestId('video-block') },
  { name: 'Panel', selector: () => screen.getByTestId('panel-block') },
  { name: 'Status', selector: () => screen.getByTestId('status-block') },
  { name: 'List (Bullet)', selector: () => screen.getByRole('list') },
  { name: 'Table', selector: () => screen.getByRole('table') },
];

describe('LumiaCompatibility Suite', () => {
  it('renders all block definitions from the compatibility suite fixture', () => {
    render(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <LumiaDocument value={compatibilityFixture as any} />,
    );

    // 1. General Smoke Test - No Crashes
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Compatibility Suite',
    );

    // 2. Iterate through required blocks map
    REQUIRED_BLOCK_SELECTORS.forEach(({ selector }) => {
      const element = selector();
      expect(element).toBeInTheDocument();
    });

    // 3. Deep checks for specific properties (ensure JSON fields map to Props)

    // Image
    const image = screen.getByTestId('image-block');
    expect(image).toHaveAttribute('data-src', 'https://placehold.co/400');
    expect(image).toHaveAttribute('data-alt', 'Test Image');

    // Video
    const video = screen.getByTestId('video-block');
    expect(video).toHaveAttribute('data-provider', 'youtube');
    expect(video).toHaveAttribute('data-title', 'Test Video');

    // Panel & Nested content
    const panel = screen.getByTestId('panel-block');
    expect(panel).toHaveAttribute('data-variant', 'info');
    expect(panel).toHaveTextContent('This is an info panel.');

    // Status
    const status = screen.getByTestId('status-block');
    expect(status).toHaveAttribute('data-status', 'success');
    expect(status).toHaveTextContent('Approved');

    // Table Structure
    const table = screen.getByRole('table');
    const headers = table.querySelectorAll('th');
    expect(headers).toHaveLength(2);
    expect(headers[0]).toHaveTextContent('Header A');
    expect(headers[1]).toHaveTextContent('Header B');

    const cells = table.querySelectorAll('td');
    expect(cells).toHaveLength(2);
    expect(cells[0]).toHaveTextContent('Value A');
    expect(cells[1]).toHaveTextContent('Value B');
  });
});
