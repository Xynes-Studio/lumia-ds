import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  Input,
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
  const [currentTitle, setCurrentTitle] = useState<string>('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Store the pending title to save on blur (not on every keystroke)
  const pendingTitleRef = useRef<string>('');

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      // Skip updates while popover is open to prevent interference
      if (isPopoverOpen) {
        return;
      }

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
          const newKey = panelNode.getKey();
          setActivePanelKey(newKey);
          setCurrentVariant(panelNode.getVariant());
          const title = panelNode.getTitle() || '';
          setCurrentTitle(title);
          pendingTitleRef.current = title;
          setPanelElement(editor.getElementByKey(newKey));
        } else {
          setActivePanelKey(null);
          setPanelElement(null);
        }
      });
    });
  }, [editor, isPopoverOpen]);

  const handleVariantChange = useCallback(
    (variant: PanelVariant, label: string) => {
      if (activePanelKey) {
        editor.update(
          () => {
            const node = $getNodeByKey(activePanelKey);
            if ($isPanelBlockNode(node)) {
              node.setVariant(variant);
              node.setIcon(variant);
              // Update title if it's a default title
              const oldTitle = node.getTitle() || '';
              if (
                oldTitle.includes('Panel') ||
                ['Info', 'Warning', 'Success', 'Note'].includes(oldTitle)
              ) {
                node.setTitle(`${label} Panel`);
                setCurrentTitle(`${label} Panel`);
                pendingTitleRef.current = `${label} Panel`;
              }
            }
          },
          { discrete: true },
        );
        setCurrentVariant(variant);
      }
    },
    [activePanelKey, editor],
  );

  // Only update local state on change, NOT the editor
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value;
      setCurrentTitle(newTitle);
      pendingTitleRef.current = newTitle;
    },
    [],
  );

  // Save title to editor only on blur
  const handleTitleBlur = useCallback(() => {
    if (activePanelKey) {
      editor.update(
        () => {
          const node = $getNodeByKey(activePanelKey);
          if ($isPanelBlockNode(node)) {
            node.setTitle(pendingTitleRef.current);
          }
        },
        { discrete: true },
      );
    }
  }, [activePanelKey, editor]);

  const handlePopoverOpenChange = useCallback(
    (open: boolean) => {
      // If closing, save any pending title changes
      if (!open && activePanelKey) {
        editor.update(
          () => {
            const node = $getNodeByKey(activePanelKey);
            if ($isPanelBlockNode(node)) {
              node.setTitle(pendingTitleRef.current);
            }
          },
          { discrete: true },
        );
      }
      setIsPopoverOpen(open);
    },
    [activePanelKey, editor],
  );

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
      <Popover open={isPopoverOpen} onOpenChange={handlePopoverOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 bg-background shadow-sm border border-border"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-56 p-3"
          align="end"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="space-y-3">
            {/* Title Input */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Panel Title
              </label>
              <Input
                value={currentTitle}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                placeholder="Enter title..."
                className="h-8 text-sm"
              />
            </div>

            {/* Variant Selection - Compact icons */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Panel Type
              </label>
              <div className="flex gap-1">
                {VARIANTS.map(({ variant, label, icon: Icon, color }) => (
                  <Button
                    key={variant}
                    variant="ghost"
                    size="icon"
                    title={label}
                    className={`h-8 w-8 ${currentVariant === variant ? 'bg-accent ring-1 ring-primary' : ''}`}
                    onClick={() => handleVariantChange(variant, label)}
                  >
                    <Icon className={`h-4 w-4 ${color}`} />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>,
    anchorElem,
  );
}
