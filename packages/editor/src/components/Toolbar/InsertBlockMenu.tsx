import React, { useState, useCallback, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  LexicalEditor,
  $insertNodes,
  $isRootOrShadowRoot,
  $createParagraphNode,
} from 'lexical';
import { $wrapNodeInElement, $insertNodeToNearestRoot } from '@lexical/utils';
import {
  Button,
  Menu,
  MenuContent,
  MenuTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@lumia/components';
import { Plus, ChevronDown, LucideIcon } from 'lucide-react';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import { getInsertableBlocks, BlockDefinition, BlockType } from '../../blocks';
import { INSERT_IMAGE_BLOCK_COMMAND } from '../../plugins/InsertImagePlugin';
import { INSERT_VIDEO_BLOCK_COMMAND } from '../../plugins/InsertVideoPlugin';
import { INSERT_FILE_BLOCK_COMMAND } from '../../plugins/InsertFilePlugin';
import { INSERT_PANEL_COMMAND } from '../../plugins/InsertPanelPlugin';
import { INSERT_STATUS_COMMAND } from '../../plugins/InsertStatusPlugin';
import { PanelVariant } from '../../nodes/PanelBlockNode/PanelBlockNode';
import { MediaInsertTabs } from '../MediaInsert';
import { useMediaContext } from '../../EditorProvider';
import { $createImageBlockNode } from '../../nodes/ImageBlockNode/ImageBlockNode';
import { $createVideoBlockNode } from '../../nodes/VideoBlockNode';

interface InsertBlockMenuProps {
  className?: string;
}

/**
 * Insert menu that displays all insertable blocks from the BlockRegistry.
 * Menu items are dynamically generated based on blocks with insertable: true.
 */
export function InsertBlockMenu({ className }: InsertBlockMenuProps) {
  const [editor] = useLexicalComposerContext();
  const [isOpen, setIsOpen] = useState(false);
  const insertableBlocks = getInsertableBlocks();

  return (
    <Menu open={isOpen} onOpenChange={setIsOpen}>
      <MenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`gap-1 ${className ?? ''}`}
          aria-label="Insert block"
          title="Insert block"
        >
          <Plus className="h-4 w-4" />
          Insert
          <ChevronDown className="h-3 w-3" />
        </Button>
      </MenuTrigger>
      <MenuContent align="start" className="min-w-[180px]">
        {insertableBlocks.map((block) => (
          <InsertBlockMenuItem
            key={block.type}
            block={block}
            editor={editor}
            onClose={() => setIsOpen(false)}
          />
        ))}
      </MenuContent>
    </Menu>
  );
}

interface InsertBlockMenuItemProps {
  block: BlockDefinition;
  editor: LexicalEditor;
  onClose: () => void;
}

/**
 * Individual menu item for inserting a block.
 * Handles both simple command dispatch and custom dialogs.
 */
function InsertBlockMenuItem({
  block,
  editor,
  onClose,
}: InsertBlockMenuItemProps) {
  const Icon = block.icon as LucideIcon;

  // For simple command blocks, dispatch directly
  if (block.insertAction === 'command') {
    return (
      <button
        className="relative flex w-full cursor-default select-none items-center gap-3 rounded-md px-3 py-2 text-sm font-medium outline-none transition-colors hover:bg-muted focus:bg-muted"
        onClick={() => {
          handleSimpleInsert(block.type, editor);
          onClose();
        }}
      >
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1 truncate">{block.label}</span>
      </button>
    );
  }

  // For custom action blocks, render specialized components
  return (
    <CustomInsertMenuItem block={block} editor={editor} onClose={onClose} />
  );
}

/**
 * Handle simple insert commands that don't require additional input
 */
function handleSimpleInsert(type: BlockType, editor: LexicalEditor) {
  switch (type) {
    case 'table':
      // Insert table without headers first (includeHeaders: true creates BOTH row AND column headers)
      editor.dispatchCommand(INSERT_TABLE_COMMAND, {
        rows: '3',
        columns: '3',
        includeHeaders: false,
      });
      // After table insertion, toggle only the first row as header
      setTimeout(() => {
        editor.update(() => {
          // Import dynamically to avoid circular dependencies

          const {
            $toggleTableHeaderRow,
          } = require('../../plugins/TableActionMenuPlugin/tableUtils');
          $toggleTableHeaderRow(true);
        });
      }, 0);
      break;
    case 'status':
      editor.dispatchCommand(INSERT_STATUS_COMMAND, {
        text: 'Status',
        color: 'info',
      });
      break;
    default:
      console.warn(`No simple insert handler for block type: ${type}`);
  }
}

interface CustomInsertMenuItemProps {
  block: BlockDefinition;
  editor: LexicalEditor;
  onClose: () => void;
}

/**
 * Menu items that require additional input (URL, variant selection, etc.)
 */
function CustomInsertMenuItem({
  block,
  editor,
  onClose,
}: CustomInsertMenuItemProps) {
  const Icon = block.icon as LucideIcon;

  switch (block.type) {
    case 'image':
      return (
        <ImageInsertItem
          icon={Icon}
          label={block.label}
          editor={editor}
          onClose={onClose}
        />
      );
    case 'video':
      return (
        <VideoInsertItem
          icon={Icon}
          label={block.label}
          editor={editor}
          onClose={onClose}
        />
      );
    case 'file':
      return (
        <FileInsertItem
          icon={Icon}
          label={block.label}
          editor={editor}
          onClose={onClose}
        />
      );
    case 'panel':
      return (
        <PanelInsertItem
          icon={Icon}
          label={block.label}
          editor={editor}
          onClose={onClose}
        />
      );
    default:
      // Fallback to simple button
      return (
        <button
          className="relative flex w-full cursor-default select-none items-center gap-3 rounded-md px-3 py-2 text-sm font-medium outline-none transition-colors hover:bg-muted focus:bg-muted"
          onClick={onClose}
        >
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 truncate">{block.label}</span>
        </button>
      );
  }
}

// Image Insert Component
interface ImageInsertItemProps {
  icon: LucideIcon;
  label: string;
  editor: LexicalEditor;
  onClose: () => void;
}

function ImageInsertItem({
  icon: Icon,
  label,
  editor,
  onClose,
}: ImageInsertItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const mediaConfig = useMediaContext();

  const handleInsertFromUrl = useCallback(
    (url: string, metadata?: { alt?: string }) => {
      editor.dispatchCommand(INSERT_IMAGE_BLOCK_COMMAND, {
        src: url,
        alt: metadata?.alt || '',
      });
      setIsOpen(false);
      onClose();
    },
    [editor, onClose],
  );

  const handleInsertFromFile = useCallback(
    (file: File) => {
      if (!mediaConfig?.uploadAdapter) return;

      mediaConfig.callbacks?.onUploadStart?.(file, 'image');
      const previewUrl = URL.createObjectURL(file);

      editor.update(() => {
        const imageNode = $createImageBlockNode({
          src: previewUrl,
          alt: file.name,
          status: 'uploading',
        });
        $insertNodes([imageNode]);
        if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
          $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
        }

        const nodeKey = imageNode.getKey();

        mediaConfig
          .uploadAdapter!.uploadFile(file)
          .then((result) => {
            mediaConfig.callbacks?.onUploadComplete?.(file, result);
            editor.update(() => {
              const node = editor._editorState._nodeMap.get(nodeKey);
              if (node && node.__type === 'image-block') {
                const writable = node.getWritable();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (writable as any).__src = result.url;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (writable as any).__status = 'uploaded';
              }
            });
          })
          .catch((error) => {
            mediaConfig.callbacks?.onUploadError?.(
              file,
              error instanceof Error ? error : new Error('Upload failed'),
            );
            editor.update(() => {
              const node = editor._editorState._nodeMap.get(nodeKey);
              if (node && node.__type === 'image-block') {
                const writable = node.getWritable();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (writable as any).__status = 'error';
              }
            });
          });
      });

      setIsOpen(false);
      onClose();
    },
    [editor, mediaConfig, onClose],
  );

  const handleCancel = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative flex w-full cursor-default select-none items-center gap-3 rounded-md px-3 py-2 text-sm font-medium outline-none transition-colors hover:bg-muted focus:bg-muted"
          onClick={() => setIsOpen(true)}
        >
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 truncate">{label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start" side="right">
        <MediaInsertTabs
          mediaType="image"
          onInsertFromUrl={handleInsertFromUrl}
          onInsertFromFile={handleInsertFromFile}
          onCancel={handleCancel}
          showAltText={true}
        />
      </PopoverContent>
    </Popover>
  );
}

// Video Insert Component
interface VideoInsertItemProps {
  icon: LucideIcon;
  label: string;
  editor: LexicalEditor;
  onClose: () => void;
}

function VideoInsertItem({
  icon: Icon,
  label,
  editor,
  onClose,
}: VideoInsertItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const mediaConfig = useMediaContext();

  const handleInsertFromUrl = useCallback(
    (url: string) => {
      editor.dispatchCommand(INSERT_VIDEO_BLOCK_COMMAND, {
        src: url,
      });
      setIsOpen(false);
      onClose();
    },
    [editor, onClose],
  );

  const handleInsertFromFile = useCallback(
    (file: File) => {
      if (!mediaConfig?.uploadAdapter) return;

      mediaConfig.callbacks?.onUploadStart?.(file, 'video');
      const previewUrl = URL.createObjectURL(file);

      editor.update(() => {
        const videoNode = $createVideoBlockNode({
          src: previewUrl,
          provider: 'html5',
          title: file.name,
          status: 'uploading',
        });

        $insertNodeToNearestRoot(videoNode);
        const paragraphNode = $createParagraphNode();
        videoNode.insertAfter(paragraphNode);
        paragraphNode.select();

        const nodeKey = videoNode.getKey();

        mediaConfig
          .uploadAdapter!.uploadFile(file)
          .then((result) => {
            mediaConfig.callbacks?.onUploadComplete?.(file, result);
            editor.update(() => {
              const node = editor._editorState._nodeMap.get(nodeKey);
              if (node && node.__type === 'video-block') {
                const writable = node.getWritable();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (writable as any).__src = result.url;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (writable as any).__status = 'uploaded';
              }
            });
          })
          .catch((error) => {
            mediaConfig.callbacks?.onUploadError?.(
              file,
              error instanceof Error ? error : new Error('Upload failed'),
            );
            editor.update(() => {
              const node = editor._editorState._nodeMap.get(nodeKey);
              if (node && node.__type === 'video-block') {
                const writable = node.getWritable();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (writable as any).__status = 'error';
              }
            });
          });
      });

      setIsOpen(false);
      onClose();
    },
    [editor, mediaConfig, onClose],
  );

  const handleCancel = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative flex w-full cursor-default select-none items-center gap-3 rounded-md px-3 py-2 text-sm font-medium outline-none transition-colors hover:bg-muted focus:bg-muted"
          onClick={() => setIsOpen(true)}
        >
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 truncate">{label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start" side="right">
        <MediaInsertTabs
          mediaType="video"
          onInsertFromUrl={handleInsertFromUrl}
          onInsertFromFile={handleInsertFromFile}
          onCancel={handleCancel}
          urlPlaceholder="https://youtube.com/watch?v=..."
        />
      </PopoverContent>
    </Popover>
  );
}

// File Insert Component
interface FileInsertItemProps {
  icon: LucideIcon;
  label: string;
  editor: LexicalEditor;
  onClose: () => void;
}

function FileInsertItem({
  icon: Icon,
  label,
  editor,
  onClose,
}: FileInsertItemProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        editor.dispatchCommand(INSERT_FILE_BLOCK_COMMAND, {
          url: '',
          filename: file.name,
          size: file.size,
          mime: file.type,
          file: file,
        });
        onClose();
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [editor, onClose],
  );

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        style={{ display: 'none' }}
      />
      <button
        className="relative flex w-full cursor-default select-none items-center gap-3 rounded-md px-3 py-2 text-sm font-medium outline-none transition-colors hover:bg-muted focus:bg-muted"
        onClick={() => fileInputRef.current?.click()}
      >
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1 truncate">{label}</span>
      </button>
    </>
  );
}

// Panel Insert Component
interface PanelInsertItemProps {
  icon: LucideIcon;
  label: string;
  editor: LexicalEditor;
  onClose: () => void;
}

const PANEL_VARIANTS: {
  variant: PanelVariant;
  label: string;
  color: string;
}[] = [
  { variant: 'info', label: 'Info', color: 'text-blue-500' },
  { variant: 'warning', label: 'Warning', color: 'text-yellow-500' },
  { variant: 'success', label: 'Success', color: 'text-green-500' },
  { variant: 'note', label: 'Note', color: 'text-gray-500' },
];

function PanelInsertItem({
  icon: Icon,
  label,
  editor,
  onClose,
}: PanelInsertItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleInsert = useCallback(
    (variant: PanelVariant, variantLabel: string) => {
      editor.dispatchCommand(INSERT_PANEL_COMMAND, {
        variant,
        title: variantLabel,
      });
      setIsOpen(false);
      onClose();
    },
    [editor, onClose],
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative flex w-full cursor-default select-none items-center gap-3 rounded-md px-3 py-2 text-sm font-medium outline-none transition-colors hover:bg-muted focus:bg-muted"
          onClick={() => setIsOpen(true)}
        >
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 truncate">{label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="start" side="right">
        <div className="flex flex-col gap-1">
          {PANEL_VARIANTS.map(({ variant, label: variantLabel, color }) => (
            <Button
              key={variant}
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => handleInsert(variant, variantLabel)}
            >
              <span
                className={`mr-2 h-2 w-2 rounded-full ${color} bg-current`}
              />
              {variantLabel}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
