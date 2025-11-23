import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { createRoot } from 'react-dom/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
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
