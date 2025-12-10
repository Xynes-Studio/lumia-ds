import React, { useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@lumia/components';
import {
  Info,
  AlertTriangle,
  CheckCircle,
  StickyNote,
  AppWindow,
} from 'lucide-react';
import { INSERT_PANEL_COMMAND } from '../../plugins/InsertPanelPlugin';
import { PanelVariant } from '../../nodes/PanelBlockNode/PanelBlockNode';

const VARIANTS: {
  variant: PanelVariant;
  label: string;
  icon: React.ElementType;
  color: string;
}[] = [
  { variant: 'info', label: 'Info', icon: Info, color: 'text-blue-500' },
  {
    variant: 'warning',
    label: 'Warning',
    icon: AlertTriangle,
    color: 'text-yellow-500',
  },
  {
    variant: 'success',
    label: 'Success',
    icon: CheckCircle,
    color: 'text-green-500',
  },
  { variant: 'note', label: 'Note', icon: StickyNote, color: 'text-gray-500' },
];

export function PanelToolbarButton() {
  const [editor] = useLexicalComposerContext();
  const [isOpen, setIsOpen] = useState(false);

  const handleInsertPanel = (variant: PanelVariant, label: string) => {
    editor.dispatchCommand(INSERT_PANEL_COMMAND, {
      variant,
      title: label,
    });
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Insert Panel"
          title="Insert Panel"
        >
          <AppWindow className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="start">
        <div className="flex flex-col gap-1">
          {VARIANTS.map(({ variant, label, icon: Icon, color }) => (
            <Button
              key={variant}
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => handleInsertPanel(variant, label)}
            >
              <Icon className={`mr-2 h-4 w-4 ${color}`} />
              {label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
