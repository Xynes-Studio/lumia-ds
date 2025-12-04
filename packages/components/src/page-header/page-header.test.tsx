import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { Button } from '../button/button';
import { PageHeader } from './page-header';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('PageHeader', () => {
  it('renders title, subtitle, and breadcrumbs', async () => {
    const { host, root } = createTestRoot();

    await act(async () => {
      root.render(
        <PageHeader
          title="Orders"
          subtitle="Track recent purchases and invoices."
          breadcrumbs={[{ label: 'Home', href: '#home' }, { label: 'Orders' }]}
        />,
      );
    });

    const heading = host.querySelector('h1');
    const subtitle = host.querySelector('p');
    const nav = host.querySelector('nav[aria-label="Breadcrumb"]');

    expect(heading?.textContent).toBe('Orders');
    expect(subtitle?.textContent).toBe('Track recent purchases and invoices.');
    expect(nav).not.toBeNull();

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('renders actions inside the toolbar when provided', async () => {
    const { host, root } = createTestRoot();

    await act(async () => {
      root.render(
        <PageHeader
          title="Projects"
          secondaryActions={[
            <Button key="share" data-testid="secondary-action" variant="ghost">
              Share
            </Button>,
            <Button key="export" data-testid="secondary-action">
              Export
            </Button>,
          ]}
          primaryAction={
            <Button data-testid="primary-action">New project</Button>
          }
        />,
      );
    });

    const actions = host.querySelector('[data-page-header-actions]');
    const secondaryButtons = host.querySelectorAll(
      '[data-testid="secondary-action"]',
    );
    const primary = host.querySelector('[data-testid="primary-action"]');

    expect(actions).not.toBeNull();
    expect(secondaryButtons.length).toBe(2);
    expect(primary?.textContent).toContain('New project');
    expect(actions?.textContent?.trim().startsWith('Share')).toBe(true);

    await act(async () => {
      root.render(<PageHeader title="Projects" />);
    });

    expect(host.querySelector('[data-page-header-actions]')).toBeNull();

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
