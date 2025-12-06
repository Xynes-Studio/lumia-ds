import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  LexicalNode,
  $getNodeByKey,
} from 'lexical';
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
  Settings,
} from 'lucide-react';
import {
  $isPanelBlockNode,
  PanelBlockNode,
  PanelVariant,
} from '../../nodes/PanelBlockNode/PanelBlockNode';

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

function $getPanelNodeFromLexicalNode(
  node: LexicalNode,
): PanelBlockNode | null {
  let current: LexicalNode | null = node;
  while (current !== null) {
    if ($isPanelBlockNode(current)) {
      return current;
    }
    current = current.getParent();
  }
  return null;
}

interface PanelActionMenuProps {
  anchorElem?: HTMLElement;
}

export function PanelActionMenuPlugin({
  anchorElem = document.body,
}: PanelActionMenuProps): React.ReactNode {
  const [editor] = useLexicalComposerContext();
  const [activePanelKey, setActivePanelKey] = useState<string | null>(null);
  const [panelElement, setPanelElement] = useState<HTMLElement | null>(null);
  const [currentVariant, setCurrentVariant] = useState<PanelVariant>('info');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          setActivePanelKey(null);
          setPanelElement(null);
          return;
        }

        const anchor = selection.anchor.getNode();
        const panelNode = $getPanelNodeFromLexicalNode(anchor);

        if (panelNode) {
          setActivePanelKey(panelNode.getKey());
          setCurrentVariant(panelNode.getVariant());
          setPanelElement(editor.getElementByKey(panelNode.getKey()));
        } else {
          setActivePanelKey(null);
          setPanelElement(null);
        }
      });
    });
  }, [editor]);

  const handleVariantChange = (variant: PanelVariant, label: string) => {
    if (activePanelKey) {
      editor.update(() => {
        const node = $getNodeByKey(activePanelKey);
        if ($isPanelBlockNode(node)) {
          node.setVariant(variant);
          node.setIcon(label);
        }
      });
      setIsPopoverOpen(false);
    }
  };

  if (!activePanelKey || !panelElement) {
    return null;
  }

  const rect = panelElement.getBoundingClientRect();
  const containerRect = anchorElem.getBoundingClientRect();
  const top = rect.top - containerRect.top + 8;
  const left = rect.right - containerRect.left - 40;

  return createPortal(
    <div
      className="panel-action-menu"
      style={{
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 10,
      }}
    >
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 bg-background shadow-sm border border-border"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-1" align="end">
          <div className="flex flex-col gap-1">
            {VARIANTS.map(({ variant, label, icon: Icon, color }) => (
              <Button
                key={variant}
                variant="ghost"
                size="sm"
                className={`justify-start ${currentVariant === variant ? 'bg-accent' : ''}`}
                onClick={() => handleVariantChange(variant, label)}
              >
                <Icon className={`mr-2 h-4 w-4 ${color}`} />
                {label}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>,
    anchorElem,
  );
}
