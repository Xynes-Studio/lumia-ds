import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { createRoot } from 'react-dom/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardSubtitle,
  CardTitle,
} from './card';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('Card component', () => {
  it('renders card container and sections with default styles', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Card data-testid="card">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Supporting text</CardDescription>
          </CardHeader>
          <CardContent>Body content</CardContent>
          <CardFooter>Footer actions</CardFooter>
        </Card>,
      );
    });

    const card = host.querySelector('[data-testid="card"]');
    expect(card?.className).toContain('rounded-lg');
    expect(card?.className).toContain('border-border');
    expect(card?.className).toContain('bg-background');
    expect(card?.textContent).toContain('Card Title');
    expect(card?.textContent).toContain('Supporting text');
    expect(card?.textContent).toContain('Body content');
    expect(card?.textContent).toContain('Footer actions');

    const header = card?.firstElementChild;
    expect(header?.className).toContain('border-b');
    const footer = card?.lastElementChild;
    expect(footer?.className).toContain('border-t');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('supports header icon/actions and footer actions layout', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Card>
          <CardHeader
            data-testid="card-header"
            icon={<div data-testid="header-icon" />}
            actions={<button data-testid="header-action">Action</button>}
          >
            <CardTitle>Card title</CardTitle>
            <CardSubtitle>Subtitle copy</CardSubtitle>
          </CardHeader>
          <CardContent>Body</CardContent>
          <CardFooter
            data-testid="card-footer"
            actions={<button data-testid="footer-action">Save</button>}
          >
            <span data-testid="footer-text">Secondary info</span>
          </CardFooter>
        </Card>,
      );
    });

    const header = host.querySelector('[data-testid="card-header"]');
    const iconWrapper = header?.querySelector('span');
    expect(iconWrapper?.className).toContain('bg-muted');
    expect(header?.textContent).toContain('Card title');
    expect(header?.textContent).toContain('Subtitle copy');
    const headerAction = host.querySelector('[data-testid="header-action"]');
    expect(headerAction?.parentElement?.className).toContain('ml-auto');

    const footer = host.querySelector('[data-testid="card-footer"]');
    expect(footer?.textContent).toContain('Secondary info');
    const footerAction = host.querySelector('[data-testid="footer-action"]');
    expect(footerAction?.parentElement?.className).toContain('ml-auto');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('allows custom classNames on container and sections', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Card className="custom-card">
          <CardContent className="content-area">Content</CardContent>
        </Card>,
      );
    });

    const card = host.querySelector('.custom-card');
    expect(card).toBeTruthy();

    const content = host.querySelector('.content-area');
    expect(content?.className).toContain('px-6');
    expect(content?.className).toContain('py-4');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
