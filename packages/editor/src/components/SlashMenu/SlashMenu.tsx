import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SlashCommand } from './slashCommands';

interface SlashMenuProps {
  commands: SlashCommand[];
  onSelect: (command: SlashCommand) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

export function SlashMenu({
  commands,
  onSelect,
  onClose,
  position,
}: SlashMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    // Reset selection when commands change
    setSelectedIndex(0);
  }, [commands]);

  useEffect(() => {
    if (commands.length === 0) {
      return;
    }

    const selectedItem = itemRefs.current[selectedIndex];
    selectedItem?.scrollIntoView({
      block: 'nearest',
    });
  }, [commands.length, selectedIndex]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => (prev + 1) % commands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex(
          (prev) => (prev - 1 + commands.length) % commands.length,
        );
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        if (commands[selectedIndex]) {
          onSelect(commands[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    },
    [commands, selectedIndex, onSelect, onClose],
  );

  useEffect(() => {
    if (commands.length === 0) {
      return;
    }

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [commands.length, handleKeyDown]);

  // Close menu when clicking outside
  useEffect(() => {
    if (commands.length === 0) {
      return;
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [commands.length, onClose]);

  if (commands.length === 0) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className="slash-menu"
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 1000,
      }}
      role="listbox"
      aria-label="Slash commands"
    >
      <div className="slash-menu-content">
        {commands.map((command, index) => {
          const Icon = command.icon;
          return (
            <button
              key={command.name}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              className={`slash-menu-item ${index === selectedIndex ? 'slash-menu-item-selected' : ''}`}
              onClick={() => onSelect(command)}
              onMouseEnter={() => setSelectedIndex(index)}
              type="button"
              role="option"
              aria-selected={index === selectedIndex}
            >
              <div className="slash-menu-item-icon">
                <Icon className="h-4 w-4" />
              </div>
              <div className="slash-menu-item-content">
                <div className="slash-menu-item-label">{command.label}</div>
                <div className="slash-menu-item-description">
                  {command.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
