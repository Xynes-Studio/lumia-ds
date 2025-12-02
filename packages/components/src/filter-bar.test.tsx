import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import { Button } from './button';
import { FilterBar } from './filter-bar';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('FilterBar component', () => {
  it('renders search, quick filters, and actions', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <FilterBar
          data-testid="filter-bar"
          searchValue=""
          onSearchChange={() => {}}
          quickFilters={[
            {
              type: 'select',
              name: 'status',
              placeholder: 'Status',
              options: [{ label: 'Open', value: 'open' }],
            },
            {
              type: 'chip',
              name: 'role',
              label: 'Admins',
              value: 'admin',
              selected: true,
            },
          ]}
          actions={<Button>Invite</Button>}
        />,
      );
    });

    const container = host.querySelector('[data-testid="filter-bar"]');
    const search = host.querySelector('input');
    const select = host.querySelector('select');
    const chip = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent === 'Admins',
    );

    expect(container?.className).toContain('justify-between');
    expect(search).not.toBeNull();
    expect(search?.getAttribute('placeholder')).toBe('Search');
    expect(select?.querySelectorAll('option')).toHaveLength(2);
    expect(chip?.getAttribute('aria-pressed')).toBe('true');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('emits search and filter change events', async () => {
    const handleSearch = vi.fn();
    const handleFilter = vi.fn();
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <FilterBar
          onSearchChange={handleSearch}
          onFilterChange={handleFilter}
          quickFilters={[
            {
              type: 'select',
              name: 'status',
              placeholder: 'Status',
              options: [
                { label: 'Open', value: 'open' },
                { label: 'Closed', value: 'closed' },
              ],
            },
            {
              type: 'chip',
              name: 'role',
              label: 'Editors',
              value: 'editors',
            },
          ]}
        />,
      );
    });

    const searchInput = host.querySelector('input');
    const statusSelect = host.querySelector('select');
    const chip = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent === 'Editors',
    );

    expect(searchInput).not.toBeNull();

    await act(async () => {
      if (searchInput) {
        searchInput.value = 'Ada';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        searchInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    await act(async () => {
      if (statusSelect) {
        statusSelect.value = 'closed';
        statusSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    await act(async () => {
      chip?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(handleSearch).toHaveBeenCalledWith('Ada');
    expect(handleFilter).toHaveBeenCalledWith('status', 'closed');
    expect(handleFilter).toHaveBeenCalledWith('role', 'editors');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('keeps layout intact when search or filters are omitted', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <FilterBar actions={<Button variant="secondary">Primary action</Button>} />,
      );
    });

    const search = host.querySelector('input');
    const select = host.querySelector('select');
    const action = host.querySelector('button');

    expect(search).toBeNull();
    expect(select).toBeNull();
    expect(action?.textContent).toBe('Primary action');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
