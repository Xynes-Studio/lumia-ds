import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { DetailBlock, ListBlock } from './blocks';

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
