import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { useState } from 'react';
import { ViewToggle, type ViewMode } from './view-toggle';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { host, root };
};

const ControlledViewToggle = () => {
  const [mode, setMode] = useState<ViewMode>('grid');

  return <ViewToggle mode={mode} onChange={setMode} />;
};

describe('ViewToggle', () => {
  it('switches modes on click', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<ControlledViewToggle />);
    });

    const buttons = host.querySelectorAll('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]?.getAttribute('aria-pressed')).toBe('true');
    expect(buttons[1]?.getAttribute('aria-pressed')).toBe('false');

    await act(async () => {
      (buttons[1] as HTMLButtonElement).dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
    });

    expect(buttons[1]?.getAttribute('aria-pressed')).toBe('true');
    expect(buttons[0]?.getAttribute('aria-pressed')).toBe('false');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('responds to keyboard activation for both options', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<ControlledViewToggle />);
    });

    const buttons = host.querySelectorAll('button');

    await act(async () => {
      (buttons[1] as HTMLButtonElement).focus();
      (buttons[1] as HTMLButtonElement).dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );
    });

    expect(buttons[1]?.getAttribute('aria-pressed')).toBe('true');
    expect(buttons[0]?.getAttribute('aria-pressed')).toBe('false');
    expect(document.activeElement).toBe(buttons[1]);

    await act(async () => {
      (buttons[0] as HTMLButtonElement).focus();
      (buttons[0] as HTMLButtonElement).dispatchEvent(
        new KeyboardEvent('keydown', { key: ' ', bubbles: true }),
      );
    });

    expect(buttons[0]?.getAttribute('aria-pressed')).toBe('true');
    expect(buttons[1]?.getAttribute('aria-pressed')).toBe('false');
    expect(document.activeElement).toBe(buttons[0]);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
