import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

const BasicTabs = () => (
  <Tabs defaultValue="details">
    <TabsList>
      <TabsTrigger value="details">Details</TabsTrigger>
      <TabsTrigger value="activity">Activity</TabsTrigger>
      <TabsTrigger value="settings">Settings</TabsTrigger>
    </TabsList>
    <TabsContent value="details">Details content</TabsContent>
    <TabsContent value="activity">Activity log</TabsContent>
    <TabsContent value="settings">Settings form</TabsContent>
  </Tabs>
);

const ControlledTabs = () => {
  const [value, setValue] = useState('first');

  return (
    <Tabs value={value} onValueChange={setValue}>
      <TabsList>
        <TabsTrigger value="first">First</TabsTrigger>
        <TabsTrigger value="second">Second</TabsTrigger>
        <TabsTrigger value="third">Third</TabsTrigger>
      </TabsList>
      <TabsContent value="first">First panel</TabsContent>
      <TabsContent value="second">Second panel</TabsContent>
      <TabsContent value="third">Third panel</TabsContent>
    </Tabs>
  );
};

describe('Tabs', () => {
  it('shows only the active panel and switches on click', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<BasicTabs />);
    });

    const triggers = host.querySelectorAll('[role="tab"]');
    const panels = host.querySelectorAll('[role="tabpanel"]');

    expect(triggers).toHaveLength(3);
    expect(panels).toHaveLength(3);
    expect(triggers[0]?.getAttribute('aria-selected')).toBe('true');
    expect(panels[0]?.hasAttribute('hidden')).toBe(false);
    expect(panels[1]?.hasAttribute('hidden')).toBe(true);

    await act(async () => {
      (triggers[1] as HTMLButtonElement).dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
    });

    expect(triggers[1]?.getAttribute('aria-selected')).toBe('true');
    expect(panels[1]?.hasAttribute('hidden')).toBe(false);
    expect(panels[0]?.hasAttribute('hidden')).toBe(true);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('supports controlled value + onValueChange', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<ControlledTabs />);
    });

    const triggers = host.querySelectorAll('[role="tab"]');
    const panels = host.querySelectorAll('[role="tabpanel"]');

    expect(triggers[0]?.getAttribute('aria-selected')).toBe('true');
    expect(panels[0]?.hasAttribute('hidden')).toBe(false);

    await act(async () => {
      (triggers[2] as HTMLButtonElement).dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
    });

    expect(triggers[2]?.getAttribute('aria-selected')).toBe('true');
    expect(panels[2]?.hasAttribute('hidden')).toBe(false);
    expect(panels[0]?.hasAttribute('hidden')).toBe(true);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('moves focus and selection with arrow keys', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<BasicTabs />);
    });

    const triggers = host.querySelectorAll('[role="tab"]');
    const panels = host.querySelectorAll('[role="tabpanel"]');

    await act(async () => {
      (triggers[0] as HTMLButtonElement).focus();
      (triggers[0] as HTMLButtonElement).dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
      );
    });

    expect(document.activeElement).toBe(triggers[1]);
    expect(triggers[1]?.getAttribute('aria-selected')).toBe('true');
    expect(panels[1]?.hasAttribute('hidden')).toBe(false);
    expect(panels[0]?.hasAttribute('hidden')).toBe(true);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
