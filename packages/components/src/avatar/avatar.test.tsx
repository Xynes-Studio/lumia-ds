import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { Avatar, AvatarGroup } from './avatar';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('Avatar component', () => {
  it('shows fallback initials when the image fails to load', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Avatar src="broken.jpg" alt="Jamie Doe" fallbackInitials="JD" />,
      );
    });

    const image = host.querySelector('img');
    image?.dispatchEvent(new Event('error'));

    await act(async () => {});

    const fallback = host.querySelector('[data-lumia-avatar-fallback]');
    expect(fallback).toBeTruthy();
    expect(fallback?.textContent).toContain('JD');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('derives initials from the alt text when no fallback is provided', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<Avatar alt="Taylor Swift" />);
    });

    const fallback = host.querySelector('[data-lumia-avatar-fallback]');
    expect(fallback).toBeTruthy();
    expect(fallback?.textContent).toContain('TS');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('renders group with overflow indicator respecting max count', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <AvatarGroup
          size="sm"
          max={3}
          avatars={[
            { src: '1.png', alt: 'One' },
            { src: '2.png', alt: 'Two' },
            { src: '3.png', alt: 'Three' },
            { src: '4.png', alt: 'Four' },
            { alt: 'Five', fallbackInitials: 'FV' },
          ]}
        />,
      );
    });

    const avatars = host.querySelectorAll('[data-lumia-avatar]');
    const overflow = host.querySelector('[data-lumia-avatar-overflow]');

    expect(avatars).toHaveLength(2);
    expect(overflow?.textContent).toBe('+3');
    expect(overflow?.className).toContain('h-8');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('applies configured sizing classes', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<Avatar size="lg" alt="Jordan Blue" />);
    });

    const avatar = host.querySelector('[data-lumia-avatar]');
    expect(avatar?.getAttribute('data-size')).toBe('lg');
    expect(avatar?.className).toContain('h-12');
    expect(avatar?.className).toContain('w-12');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
