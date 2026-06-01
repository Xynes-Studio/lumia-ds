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

  describe('underline variant', () => {
    const UnderlineTabs = () => (
      <Tabs defaultValue="domains" variant="underline">
        <TabsList>
          <TabsTrigger value="domains" count={3}>
            Domains
          </TabsTrigger>
          <TabsTrigger value="apikeys" count={0}>
            API Keys
          </TabsTrigger>
          <TabsTrigger value="webhooks" disabled>
            Webhooks
          </TabsTrigger>
        </TabsList>
        <TabsContent value="domains">Domains content</TabsContent>
        <TabsContent value="apikeys">API keys content</TabsContent>
      </Tabs>
    );

    it('renders the underline strip with a bottom border and keeps tab semantics', async () => {
      const { root, host } = createTestRoot();

      await act(async () => {
        root.render(<UnderlineTabs />);
      });

      const list = host.querySelector('[role="tablist"]');
      const triggers = host.querySelectorAll('[role="tab"]');
      const panels = host.querySelectorAll('[role="tabpanel"]');

      // underline list is border-led, not the segmented muted box
      expect(list?.className).toContain('border-b');
      expect(list?.className).not.toContain('bg-muted/60');

      expect(triggers).toHaveLength(3);
      expect(triggers[0]?.getAttribute('aria-selected')).toBe('true');
      expect(triggers[2]?.hasAttribute('disabled')).toBe(true);

      // underline panel renders flush (no card border / shadow)
      expect(panels[0]?.className).not.toContain('shadow-sm');
      expect(panels[0]?.hasAttribute('hidden')).toBe(false);
      expect(panels[1]?.hasAttribute('hidden')).toBe(true);

      await act(async () => root.unmount());
      document.body.removeChild(host);
    });

    it('renders active-aware count badges', async () => {
      const { root, host } = createTestRoot();

      await act(async () => {
        root.render(<UnderlineTabs />);
      });

      const triggers = host.querySelectorAll('[role="tab"]');
      const activeBadge = triggers[0]?.querySelector(
        'span[aria-hidden="true"]',
      );
      const inactiveBadge = triggers[1]?.querySelector(
        'span[aria-hidden="true"]',
      );

      expect(activeBadge?.textContent).toBe('3');
      expect(activeBadge?.className).toContain('bg-foreground');

      // a zero count still renders (so empty sections show "0"), but muted
      expect(inactiveBadge?.textContent).toBe('0');
      expect(inactiveBadge?.className).toContain('bg-muted');

      await act(async () => root.unmount());
      document.body.removeChild(host);
    });
  });
});
