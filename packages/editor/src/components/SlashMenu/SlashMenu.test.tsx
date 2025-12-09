import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SlashMenu } from './SlashMenu';
import { SlashCommand } from './slashCommands';
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';
import { Type, Heading1, List } from 'lucide-react';

describe('SlashMenu', () => {
  const mockOnSelect = vi.fn();
  const mockOnClose = vi.fn();

  const mockCommands: SlashCommand[] = [
    {
      name: 'paragraph',
      label: 'Paragraph',
      description: 'Plain text paragraph',
      icon: Type,
      keywords: ['text'],
      execute: vi.fn(),
    },
    {
      name: 'heading1',
      label: 'Heading 1',
      description: 'Large heading',
      icon: Heading1,
      keywords: ['h1'],
      execute: vi.fn(),
    },
    {
      name: 'bullet-list',
      label: 'Bullet List',
      description: 'Create a bulleted list',
      icon: List,
      keywords: ['ul'],
      execute: vi.fn(),
    },
  ];

  const defaultPosition = { top: 100, left: 200 };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when commands array is empty', () => {
    const { container } = render(
      <SlashMenu
        commands={[]}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={defaultPosition}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders all commands', () => {
    render(
      <SlashMenu
        commands={mockCommands}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={defaultPosition}
      />,
    );

    expect(screen.getByText('Paragraph')).toBeInTheDocument();
    expect(screen.getByText('Heading 1')).toBeInTheDocument();
    expect(screen.getByText('Bullet List')).toBeInTheDocument();
  });

  it('renders with correct position', () => {
    render(
      <SlashMenu
        commands={mockCommands}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={defaultPosition}
      />,
    );

    const menu = screen.getByRole('listbox');
    expect(menu).toHaveStyle({ top: '100px', left: '200px' });
  });

  it('selects first command by default', () => {
    render(
      <SlashMenu
        commands={mockCommands}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={defaultPosition}
      />,
    );

    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    expect(options[1]).toHaveAttribute('aria-selected', 'false');
  });

  it('navigates down with ArrowDown key', () => {
    render(
      <SlashMenu
        commands={mockCommands}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={defaultPosition}
      />,
    );

    fireEvent.keyDown(document, { key: 'ArrowDown' });

    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'false');
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('navigates up with ArrowUp key', () => {
    render(
      <SlashMenu
        commands={mockCommands}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={defaultPosition}
      />,
    );

    // Go to last item (wraps around)
    fireEvent.keyDown(document, { key: 'ArrowUp' });

    const options = screen.getAllByRole('option');
    expect(options[2]).toHaveAttribute('aria-selected', 'true');
  });

  it('selects command with Enter key', () => {
    render(
      <SlashMenu
        commands={mockCommands}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={defaultPosition}
      />,
    );

    fireEvent.keyDown(document, { key: 'Enter' });

    expect(mockOnSelect).toHaveBeenCalledWith(mockCommands[0]);
  });

  it('selects command with Tab key', () => {
    render(
      <SlashMenu
        commands={mockCommands}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={defaultPosition}
      />,
    );

    fireEvent.keyDown(document, { key: 'Tab' });

    expect(mockOnSelect).toHaveBeenCalledWith(mockCommands[0]);
  });

  it('closes menu with Escape key', () => {
    render(
      <SlashMenu
        commands={mockCommands}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={defaultPosition}
      />,
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('selects command on click', () => {
    render(
      <SlashMenu
        commands={mockCommands}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={defaultPosition}
      />,
    );

    fireEvent.click(screen.getByText('Heading 1'));

    expect(mockOnSelect).toHaveBeenCalledWith(mockCommands[1]);
  });

  it('updates selection on mouse enter', () => {
    render(
      <SlashMenu
        commands={mockCommands}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={defaultPosition}
      />,
    );

    const bulletListButton = screen.getByText('Bullet List').closest('button');
    if (bulletListButton) {
      fireEvent.mouseEnter(bulletListButton);
    }

    const options = screen.getAllByRole('option');
    expect(options[2]).toHaveAttribute('aria-selected', 'true');
  });

  it('closes menu when clicking outside', () => {
    render(
      <SlashMenu
        commands={mockCommands}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={defaultPosition}
      />,
    );

    fireEvent.mouseDown(document.body);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not close menu when clicking inside', () => {
    render(
      <SlashMenu
        commands={mockCommands}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={defaultPosition}
      />,
    );

    const menu = screen.getByRole('listbox');
    fireEvent.mouseDown(menu);

    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
