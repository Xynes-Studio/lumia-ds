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

  useEffect(() => {
    // Reset selection when commands change
    setSelectedIndex(0);
  }, [commands]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % commands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + commands.length) % commands.length,
        );
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (commands[selectedIndex]) {
          onSelect(commands[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [commands, selectedIndex, onSelect, onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

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
              className={`slash-menu-item ${index === selectedIndex ? 'slash-menu-item-selected' : ''}`}
              onClick={() => onSelect(command)}
              onMouseEnter={() => setSelectedIndex(index)}
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
