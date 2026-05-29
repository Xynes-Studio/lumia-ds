import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Dropdown, type DropdownOption } from './Dropdown';

// Render the Lumia Popover primitives inline so the listbox is in the DOM only
// while "open", without pulling in Radix's portal/focus machinery.
vi.mock('@lumia-ui/components', async () => {
  const { createContext, useContext, createElement } = await import('react');
  const Ctx = createContext(false);
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Popover: ({ children, open }: any) =>
      createElement(Ctx.Provider, { value: !!open }, children),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PopoverTrigger: ({ children }: any) => children,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PopoverContent: ({ children }: any) => {
      const open = useContext(Ctx);
      return open ? createElement('div', null, children) : null;
    },
  };
});

const OPTIONS: DropdownOption[] = [
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
];

function renderDropdown(
  props: Partial<React.ComponentProps<typeof Dropdown>> = {},
) {
  const onChange = vi.fn();
  render(
    <Dropdown
      value="paragraph"
      onChange={onChange}
      options={OPTIONS}
      aria-label="Block Type"
      {...props}
    />,
  );
  return { onChange };
}

describe('Dropdown', () => {
  it('renders a Lumia combobox trigger showing the selected label', () => {
    renderDropdown();
    const trigger = screen.getByRole('combobox', { name: 'Block Type' });
    expect(trigger).toHaveAttribute('data-lumia-component', 'dropdown');
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    expect(trigger).toHaveTextContent('Paragraph');
  });

  it('shows the placeholder when the value matches no option', () => {
    renderDropdown({ value: '', placeholder: 'Pick one' });
    expect(screen.getByRole('combobox')).toHaveTextContent('Pick one');
  });

  it('associates a visible label with the trigger', () => {
    renderDropdown({ label: 'Layout', value: 'h1', 'aria-label': undefined });
    expect(
      screen.getByRole('combobox', { name: 'Layout' }),
    ).toBeInTheDocument();
  });

  it('does not render the listbox until opened', () => {
    renderDropdown();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    // Current value is marked selected.
    expect(screen.getByRole('option', { name: 'Paragraph' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('selects an option on click and closes', () => {
    const { onChange } = renderDropdown();
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });

    fireEvent.click(screen.getByRole('option', { name: 'Heading 2' }));

    expect(onChange).toHaveBeenCalledWith('h2');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('navigates with arrow keys and commits with Enter', () => {
    const { onChange } = renderDropdown();
    const trigger = screen.getByRole('combobox');
    fireEvent.keyDown(trigger, { key: 'ArrowDown' }); // open, active = paragraph (selected)

    const listbox = screen.getByRole('listbox');
    fireEvent.keyDown(listbox, { key: 'ArrowDown' }); // active = h1
    fireEvent.keyDown(listbox, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith('h1');
  });

  it('supports Home/End navigation', () => {
    const { onChange } = renderDropdown();
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });
    const listbox = screen.getByRole('listbox');

    fireEvent.keyDown(listbox, { key: 'End' });
    fireEvent.keyDown(listbox, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('h2');

    // Reopen and jump to the first option.
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowUp' });
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Home' });
    fireEvent.keyDown(screen.getByRole('listbox'), { key: ' ' });
    expect(onChange).toHaveBeenCalledWith('paragraph');
  });

  it('closes on Escape and on Tab without selecting', () => {
    const { onChange } = renderDropdown();
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Tab' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    expect(onChange).not.toHaveBeenCalled();
  });

  it('commits the option the pointer hovered last', () => {
    const { onChange } = renderDropdown();
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });

    fireEvent.mouseEnter(screen.getByRole('option', { name: 'Heading 2' }));
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith('h2');
  });

  it('does not open when disabled', () => {
    renderDropdown({ disabled: true });
    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeDisabled();

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
