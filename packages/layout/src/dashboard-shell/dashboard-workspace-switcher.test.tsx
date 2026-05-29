import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DashboardWorkspaceSwitcher,
  type DashboardWorkspaceSwitcherWorkspace,
} from './dashboard-workspace-switcher';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

if (typeof PointerEvent === 'undefined') {
  // happy-dom does not provide PointerEvent which Radix listens for
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  globalThis.PointerEvent = MouseEvent as unknown as typeof PointerEvent;
}

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  return { root, host };
};

const flushTimers = async () => {
  await act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  });
};

const workspaces: DashboardWorkspaceSwitcherWorkspace[] = [
  { id: 'ws-1', name: 'Workspace Alpha', slug: 'workspace-alpha' },
  { id: 'ws-2', name: 'Workspace Beta', slug: 'workspace-beta' },
];

const openWorkspaceMenu = async (host: HTMLElement) => {
  const trigger = host.querySelector(
    '[data-testid="dashboard-workspace-trigger"]',
  );
  expect(trigger).toBeTruthy();

  await act(async () => {
    trigger?.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        pointerType: 'mouse',
      }),
    );
    trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await flushTimers();
  return trigger as HTMLElement;
};

describe('DashboardWorkspaceSwitcher', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders the current workspace and emits workspace selection from the shared menu contract', async () => {
    const { root, host } = createTestRoot();
    const onWorkspaceSelect = vi.fn();

    await act(async () => {
      root.render(
        <DashboardWorkspaceSwitcher
          workspace={workspaces[0]}
          workspaceOptions={workspaces}
          onWorkspaceSelect={onWorkspaceSelect}
          onCreateWorkspace={vi.fn()}
          labels={{
            trigger: '[Switch workspace]',
            currentSection: '[Current context]',
            currentBadge: '[Active]',
            switchToSection: '[Move to]',
            createAction: '[Create workspace]',
          }}
        />,
      );
    });

    const trigger = await openWorkspaceMenu(host);

    expect(trigger.getAttribute('aria-label')).toBe('[Switch workspace]');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(document.body.textContent).toContain('[Current context]');
    expect(document.body.textContent).toContain('[Active]');
    expect(document.body.textContent).toContain('[Move to]');
    expect(document.body.textContent).toContain('[Create workspace]');
    expect(
      document.body
        .querySelector('[data-testid="dashboard-workspace-current"]')
        ?.getAttribute('aria-current'),
    ).toBe('true');

    await act(async () => {
      document.body
        .querySelector('[data-workspace-id="ws-2"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await flushTimers();

    expect(onWorkspaceSelect).toHaveBeenCalledWith('ws-2');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);

    await act(async () => root.unmount());
    host.remove();
  });

  it('supports disabled workspace creation with explanatory copy', async () => {
    const { root, host } = createTestRoot();
    const onCreateWorkspace = vi.fn();

    await act(async () => {
      root.render(
        <DashboardWorkspaceSwitcher
          workspace={workspaces[0]}
          workspaceOptions={workspaces}
          onWorkspaceSelect={vi.fn()}
          onCreateWorkspace={onCreateWorkspace}
          enableWorkspaceCreation={false}
          workspaceCreationDisabledMessage="[Ask an owner before creating another workspace.]"
          labels={{
            createUnavailableAction: '[Creation unavailable]',
          }}
        />,
      );
    });

    await openWorkspaceMenu(host);

    const disabledCreate = document.body.querySelector(
      '[data-testid="dashboard-workspace-create-disabled"]',
    );
    expect(disabledCreate?.textContent).toContain('[Creation unavailable]');
    expect(document.body.textContent).toContain(
      '[Ask an owner before creating another workspace.]',
    );
    expect(onCreateWorkspace).not.toHaveBeenCalled();

    await act(async () => root.unmount());
    host.remove();
  });

  it('keeps compact triggers target-sized and accessible without visible workspace text', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <DashboardWorkspaceSwitcher
          compact
          workspace={workspaces[0]}
          workspaceOptions={workspaces}
          onWorkspaceSelect={vi.fn()}
          labels={{
            trigger: '[Switch compact workspace]',
          }}
        />,
      );
    });

    const trigger = host.querySelector(
      '[data-testid="dashboard-workspace-trigger"]',
    );
    expect(trigger?.getAttribute('aria-label')).toBe(
      '[Switch compact workspace]',
    );
    expect(trigger?.className).toContain('px-2');
    expect(trigger?.className).toContain('py-2');
    expect(trigger?.textContent).not.toContain('Workspace Alpha');

    await act(async () => root.unmount());
    host.remove();
  });

  it('fills the rail width and lays the expanded trigger out as a three-cell grid (avatar / label / chevron)', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <DashboardWorkspaceSwitcher
          workspace={workspaces[0]}
          workspaceOptions={workspaces}
          onWorkspaceSelect={vi.fn()}
        />,
      );
    });

    const trigger = host.querySelector(
      '[data-testid="dashboard-workspace-trigger"]',
    );
    // Full-rail width is governed by the trigger itself, not app CSS.
    expect(trigger?.className).toContain('w-full');

    const grid = host.querySelector(
      '[data-testid="dashboard-workspace-trigger-grid"]',
    );
    expect(grid).toBeTruthy();
    // Three cells: avatar (auto) / label (1fr) / chevron (auto).
    expect(grid?.className).toContain('grid');
    expect(grid?.className).toContain('grid-cols-[auto_1fr_auto]');
    // Expanded rail shows both the label and the chevron affordance.
    expect(grid?.textContent).toContain('Workspace Alpha');
    expect(
      host.querySelector('[data-testid="dashboard-workspace-chevron"]'),
    ).toBeTruthy();

    await act(async () => root.unmount());
    host.remove();
  });

  it('hides the label and chevron in compact rail mode, leaving only the avatar', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <DashboardWorkspaceSwitcher
          compact
          workspace={workspaces[0]}
          workspaceOptions={workspaces}
          onWorkspaceSelect={vi.fn()}
        />,
      );
    });

    expect(
      host.querySelector('[data-testid="dashboard-workspace-trigger-grid"]'),
    ).toBeNull();
    expect(
      host.querySelector('[data-testid="dashboard-workspace-chevron"]'),
    ).toBeNull();

    await act(async () => root.unmount());
    host.remove();
  });
});
