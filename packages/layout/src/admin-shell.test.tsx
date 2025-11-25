import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { AdminShell } from './admin-shell';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('AdminShell', () => {
  it('renders header, responsive sidebars, and main content', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <AdminShell
          header={<div>Header Area</div>}
          sidebar={
            <nav>
              <a href="#">Nav</a>
            </nav>
          }
        >
          <section>Primary content</section>
        </AdminShell>,
      );
    });

    const header = host.querySelector('header');
    expect(header?.textContent).toContain('Header Area');
    expect(header?.className).toContain('border-b');

    const mobileSidebar = host.querySelector('[data-slot="mobile-sidebar"]');
    expect(mobileSidebar?.textContent).toContain('Nav');
    expect(mobileSidebar?.className).toContain('md:hidden');
    expect(mobileSidebar?.className).toContain('border-border');

    const desktopSidebar = host.querySelector('aside');
    expect(desktopSidebar?.textContent).toContain('Nav');
    expect(desktopSidebar?.className).toContain('md:flex');
    expect(desktopSidebar?.className).toContain('border-border');

    const main = host.querySelector('main');
    expect(main?.textContent).toContain('Primary content');
    expect(main?.className).toContain('bg-background');

    await act(async () => root.unmount());
    host.remove();
  });

  it('renders the example admin shell usage', async () => {
    const ExampleAdminShell = (
      <AdminShell
        header={<div>Admin Header</div>}
        sidebar={
          <ul>
            <li>Dashboard</li>
            <li>Reports</li>
          </ul>
        }
      >
        <p>Welcome to the dashboard</p>
      </AdminShell>
    );

    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(ExampleAdminShell);
    });

    expect(host.textContent).toContain('Admin Header');
    expect(host.textContent).toContain('Dashboard');
    expect(host.textContent).toContain('Welcome to the dashboard');

    await act(async () => root.unmount());
    host.remove();
  });
});
