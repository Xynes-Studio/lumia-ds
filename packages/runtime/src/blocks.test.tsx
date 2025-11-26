import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Simulate } from 'react-dom/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { required } from '@lumia/forms';
import { DetailBlock, FormBlock, ListBlock } from './blocks';
import type { ResourceConfig } from './index';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { host, root };
};

describe('ListBlock', () => {
  it('renders rows with configured columns', async () => {
    const { root, host } = createTestRoot();

    const rows = [
      { id: 1, name: 'Aster', status: 'Active' },
      { id: 2, name: 'Beryl', status: 'Invited' },
    ];

    await act(async () => {
      root.render(
        <ListBlock
          title="Members"
          description="Team roster"
          data={rows}
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'status', label: 'Status', align: 'end' },
          ]}
        />,
      );
    });

    const heading = host.querySelector('h3');
    expect(heading?.textContent).toContain('Members');

    const nameCell = host.querySelector(
      'tbody tr[data-row-index="0"] td[data-column-key="name"]',
    );
    expect(nameCell?.textContent).toContain('Aster');

    const statusCell = host.querySelector(
      'tbody tr[data-row-index="1"] td[data-column-key="status"]',
    );
    expect(statusCell?.textContent).toContain('Invited');
    expect(statusCell?.className).toContain('text-right');

    await act(async () => root.unmount());
    host.remove();
  });

  it('renders an empty state when there are no records', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <ListBlock
          title="Empty list"
          data={[]}
          emptyMessage="No rows"
          columns={[{ key: 'name', label: 'Name' }]}
        />,
      );
    });

    const emptyCell = host.querySelector('tbody td');
    expect(emptyCell?.textContent).toContain('No rows');
    expect(emptyCell?.getAttribute('colspan')).toBe('1');

    await act(async () => root.unmount());
    host.remove();
  });

  it('virtualizes large datasets when enabled', async () => {
    const { root, host } = createTestRoot();

    const rows = Array.from({ length: 1000 }, (_, index) => ({
      id: index + 1,
      name: `User ${index + 1}`,
      status: index % 2 === 0 ? 'Active' : 'Invited',
    }));

    await act(async () => {
      root.render(
        <ListBlock
          title="Members"
          virtualized
          data={rows}
          columns={[
            { key: 'id', label: 'ID', align: 'end' },
            { key: 'name', label: 'Name' },
          ]}
        />,
      );
    });

    const virtualBody = host.querySelector(
      '[data-virtualized-body="true"]',
    ) as HTMLDivElement | null;
    expect(virtualBody).not.toBeNull();

    if (!virtualBody) {
      throw new Error('Virtualized body not rendered');
    }

    const initialRows = virtualBody.querySelectorAll('[data-row-index]');
    expect(initialRows.length).toBeGreaterThan(0);
    expect(initialRows.length).toBeLessThan(rows.length);

    await act(async () => {
      virtualBody.scrollTop = 2000;
      Simulate.scroll(virtualBody);
      await Promise.resolve();
    });

    const updatedRows = virtualBody.querySelectorAll('[data-row-index]');
    const firstRenderedIndex = updatedRows[0]
      ? Number(updatedRows[0].getAttribute('data-row-index'))
      : 0;

    expect(firstRenderedIndex).toBeGreaterThan(0);

    await act(async () => root.unmount());
    host.remove();
  });

  it('forwards viewability callbacks when virtualized', async () => {
    const { root, host } = createTestRoot();
    const onViewableItemsChanged = vi.fn();

    const rows = Array.from({ length: 200 }, (_, index) => ({
      id: index + 1,
      name: `User ${index + 1}`,
      status: index % 2 === 0 ? 'Active' : 'Invited',
    }));

    await act(async () => {
      root.render(
        <ListBlock
          title="Members"
          virtualized
          data={rows}
          onViewableItemsChanged={onViewableItemsChanged}
          columns={[
            { key: 'id', label: 'ID', align: 'end' },
            { key: 'name', label: 'Name' },
          ]}
        />,
      );
    });

    expect(onViewableItemsChanged).toHaveBeenCalled();

    const virtualBody = host.querySelector(
      '[data-virtualized-body="true"]',
    ) as HTMLDivElement | null;
    expect(virtualBody).not.toBeNull();

    const initialIndices = onViewableItemsChanged.mock.calls[
      onViewableItemsChanged.mock.calls.length - 1
    ]?.[0]?.visibleItems.map(({ index }) => index);
    await act(async () => {
      if (!virtualBody) return;
      virtualBody.scrollTop = 800;
      Simulate.scroll(virtualBody);
      await Promise.resolve();
    });
    const afterScrollIndices = onViewableItemsChanged.mock.calls[
      onViewableItemsChanged.mock.calls.length - 1
    ]?.[0]?.visibleItems.map(({ index }) => index);
    expect(afterScrollIndices?.[0]).toBeGreaterThan(initialIndices?.[0] ?? -1);

    await act(async () => root.unmount());
    host.remove();
  });
});

describe('DetailBlock', () => {
  it('renders labeled values and respects field spans', async () => {
    const { root, host } = createTestRoot();

    const record = {
      id: 'c-100',
      profile: { name: 'River' },
      contact: { email: 'river@example.com' },
      status: 'Active',
    };

    await act(async () => {
      root.render(
        <DetailBlock
          title="Customer"
          description="Overview"
          record={record}
          columns={3}
          fields={[
            { key: 'profile.name', label: 'Name', field: 'profile.name' },
            {
              key: 'contact.email',
              label: 'Email',
              hint: 'Primary contact',
              field: 'contact.email',
            },
            { key: 'status', label: 'Status', span: 2 },
          ]}
        />,
      );
    });

    const nameField = host.querySelector('[data-field-key="profile.name"] dd');
    expect(nameField?.textContent).toContain('River');

    const emailHint = host.querySelector('[data-field-key="contact.email"] p');
    expect(emailHint?.textContent).toContain('Primary contact');

    const spanField = host.querySelector('[data-field-key="status"]');
    expect(spanField?.className).toContain('md:col-span-2');
    expect(spanField?.textContent).toContain('Active');

    await act(async () => root.unmount());
    host.remove();
  });

  it('shows an empty message when no fields are configured', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <DetailBlock record={{}} fields={[]} emptyMessage="Nothing to show" />,
      );
    });

    expect(host.textContent).toContain('Nothing to show');

    await act(async () => root.unmount());
    host.remove();
  });
});

describe('FormBlock', () => {
  type MemberForm = { name: string; role: string };

  it('renders fields and validates using form rules', async () => {
    const handleSubmit = vi.fn();
    const resource: ResourceConfig<MemberForm> = {
      id: 'members',
      fields: [
        {
          name: 'name',
          label: 'Name',
          validation: [required('Name is required')],
        },
        {
          name: 'role',
          label: 'Role',
          kind: 'select',
          options: [
            { label: 'Select a role', value: '' },
            { label: 'Admin', value: 'admin' },
          ],
          validation: [required('Role is required')],
        },
      ],
    };

    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <FormBlock
          title="Invite"
          resource={resource}
          mode="create"
          onSubmit={handleSubmit}
        />,
      );
    });

    const form = host.querySelector('form') as HTMLFormElement;
    const nameInput = host.querySelector(
      '[data-field-name="name"] input',
    ) as HTMLInputElement;
    const roleSelect = host.querySelector(
      '[data-field-name="role"] select',
    ) as HTMLSelectElement;

    await act(async () => {
      Simulate.submit(form);
      await Promise.resolve();
    });

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(
      host.querySelector('[data-field-name="name"] p')?.textContent,
    ).toContain('Name is required');
    expect(roleSelect.getAttribute('aria-invalid')).toBe('true');

    await act(async () => {
      nameInput.value = 'Nova';
      Simulate.change(nameInput, { target: { value: 'Nova' } });
      roleSelect.value = 'admin';
      Simulate.change(roleSelect, { target: { value: 'admin' } });
      await Promise.resolve();
    });

    await act(async () => {
      Simulate.submit(form);
      await Promise.resolve();
    });

    expect(handleSubmit).toHaveBeenCalledWith(
      { name: 'Nova', role: 'admin' },
      expect.anything(),
    );

    await act(async () => root.unmount());
    host.remove();
  });

  it('prefills defaults and submits via resource data fetcher', async () => {
    const update = vi.fn();
    const resource: ResourceConfig<{ name: string }> = {
      id: 'profile',
      fields: [{ name: 'name', label: 'Name' }],
      dataFetcher: { update },
    };

    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <FormBlock
          title="Edit"
          resource={resource}
          mode="update"
          initialValues={{ name: 'Existing Name' }}
        />,
      );
    });

    const form = host.querySelector('form') as HTMLFormElement;
    const nameInput = host.querySelector('input') as HTMLInputElement;
    const submitButton = host.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;

    expect(nameInput.value).toBe('Existing Name');
    expect(submitButton.textContent).toContain('Update');

    await act(async () => {
      Simulate.change(nameInput, { target: { value: 'Updated Name' } });
      await Promise.resolve();
    });

    await act(async () => {
      Simulate.submit(form);
      await Promise.resolve();
    });

    expect(update).toHaveBeenCalledWith(
      { name: 'Updated Name' },
      expect.anything(),
    );

    await act(async () => root.unmount());
    host.remove();
  });
});
