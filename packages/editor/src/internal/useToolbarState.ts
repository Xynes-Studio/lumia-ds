import { useCallback, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  SELECTION_CHANGE_COMMAND,
  $getSelection,
  $isRangeSelection,
  KEY_MODIFIER_COMMAND,
  $isTextNode,
  $createParagraphNode,
  $isDecoratorNode,
} from 'lexical';
import { mergeRegister } from '@lexical/utils';
import { TOGGLE_LINK_COMMAND, $isLinkNode } from '@lexical/link';
import { $createCodeNode, $isCodeNode } from '@lexical/code';
import { $setBlocksType, $patchStyleText } from '@lexical/selection';
import {
  $isHeadingNode,
  $createHeadingNode,
  type HeadingTagType,
} from '@lexical/rich-text';
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode,
} from '@lexical/list';
import { $getNearestNodeOfType } from '@lexical/utils';
import { useFontsConfig } from '../useFontsConfig';

export type BlockType = 'paragraph' | 'h1' | 'h2' | 'h3' | 'code';

export function useToolbarState() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isCodeBlock, setIsCodeBlock] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [selectedFont, setSelectedFont] = useState('inter');
  const [blockType, setBlockType] = useState<BlockType>('paragraph');
  const [isBulletList, setIsBulletList] = useState(false);
  const [isNumberedList, setIsNumberedList] = useState(false);
  const fontsConfig = useFontsConfig();

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    setIsEditable(editor.isEditable());
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsCode(selection.hasFormat('code'));

      // Check for block type
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();

      // Check if we're in a list
      if ($isListNode(element)) {
        const parentList = $getNearestNodeOfType<ListNode>(
          anchorNode,
          ListNode,
        );
        if (parentList) {
          const listType = parentList.getListType();
          setIsBulletList(listType === 'bullet');
          setIsNumberedList(listType === 'number');
        }
        setBlockType('paragraph');
        setIsCodeBlock(false);
      } else {
        setIsBulletList(false);
        setIsNumberedList(false);

        if ($isHeadingNode(element)) {
          const tag = element.getTag();
          setBlockType(tag as BlockType);
          setIsCodeBlock(false);
        } else if ($isCodeNode(element)) {
          setBlockType('code');
          setIsCodeBlock(true);
        } else {
          setBlockType('paragraph');
          setIsCodeBlock(false);
        }
      }

      // Check for link
      const node = selection.getNodes().find((n) => $isLinkNode(n));
      const parent = selection.anchor.getNode().getParent();
      if ($isLinkNode(parent)) {
        setIsLink(true);
        setLinkUrl(parent.getURL());
      } else if ($isLinkNode(node)) {
        setIsLink(true);
        setLinkUrl(node.getURL());
      } else {
        setIsLink(false);
        setLinkUrl('');
      }

      // Check current font-family from selection's style
      const nodes = selection.getNodes();
      if (nodes.length > 0) {
        // Check all text nodes for their fonts
        const fonts = new Set<string>();

        nodes.forEach((node) => {
          if ($isTextNode(node)) {
            const style = node.getStyle();
            if (style) {
              const fontFamilyMatch = style.match(/font-family:\s*([^;]+)/);
              if (fontFamilyMatch) {
                fonts.add(fontFamilyMatch[1].trim());
              } else {
                fonts.add('default');
              }
            } else {
              fonts.add('default');
            }
          }
        });

        // If multiple different fonts found, show empty (mixed state)
        if (fonts.size > 1) {
          setSelectedFont(''); // Empty string to show placeholder
        } else if (fonts.size === 1) {
          const fontFamily = Array.from(fonts)[0];
          if (fontFamily === 'default') {
            setSelectedFont(fontsConfig.defaultFontId);
          } else {
            // Find matching font in config by cssStack
            const matchingFont = fontsConfig.allFonts.find(
              (f) => fontFamily.includes(f.id) || fontFamily.includes(f.label),
            );
            if (matchingFont) {
              setSelectedFont(matchingFont.id);
            } else {
              setSelectedFont(fontsConfig.defaultFontId);
            }
          }
        } else {
          // No text nodes, use default
          setSelectedFont(fontsConfig.defaultFontId);
        }
      }
    }
  }, [editor, fontsConfig]);

  const insertLink = useCallback(() => {
    if (!isLink) {
      setLinkUrl('');
      setIsPopoverOpen(true);
    } else {
      // If it's already a link, we want to edit it, so we open the popover with current URL
      // The URL is already set in updateToolbar
      setIsPopoverOpen(true);
    }
  }, [isLink]);

  const onLinkSubmit = useCallback(() => {
    if (linkUrl) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
      setIsPopoverOpen(false);
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      setIsPopoverOpen(false);
    }
  }, [editor, linkUrl]);

  const handleFontChange = useCallback(
    (fontId: string) => {
      setSelectedFont(fontId);
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const font = fontsConfig.allFonts.find((f) => f.id === fontId);
          if (font) {
            // Use $patchStyleText to apply font only to selected text portion
            // This properly splits text nodes and maintains selection boundaries
            $patchStyleText(selection, {
              'font-family': font.cssStack,
            });
          }
        }
      });
    },
    [editor, fontsConfig],
  );

  const handleBlockTypeChange = useCallback(
    (newBlockType: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // Check if the selection's anchor or focus is on/near a DecoratorNode
          // $setBlocksType can inadvertently remove DecoratorNodes, so we skip
          // block type changes when DecoratorNodes are involved
          const anchorNode = selection.anchor.getNode();
          const focusNode = selection.focus.getNode();

          // Check if either the node itself or its parent is a DecoratorNode
          const isAnchorDecorator =
            $isDecoratorNode(anchorNode) ||
            $isDecoratorNode(anchorNode.getParent());
          const isFocusDecorator =
            $isDecoratorNode(focusNode) ||
            $isDecoratorNode(focusNode.getParent());

          // Also check the top-level element for decorator nodes
          const anchorTopLevel = anchorNode.getTopLevelElementOrThrow?.();
          const focusTopLevel = focusNode.getTopLevelElementOrThrow?.();
          const isAnchorTopLevelDecorator =
            anchorTopLevel && $isDecoratorNode(anchorTopLevel);
          const isFocusTopLevelDecorator =
            focusTopLevel && $isDecoratorNode(focusTopLevel);

          if (
            isAnchorDecorator ||
            isFocusDecorator ||
            isAnchorTopLevelDecorator ||
            isFocusTopLevelDecorator
          ) {
            // Skip block type change for DecoratorNodes to prevent removal
            return;
          }

          if (newBlockType === 'paragraph') {
            $setBlocksType(selection, () => $createParagraphNode());
          } else if (newBlockType === 'code') {
            $setBlocksType(selection, () => $createCodeNode());
          } else {
            $setBlocksType(selection, () =>
              $createHeadingNode(newBlockType as HeadingTagType),
            );
          }
        }
      });
    },
    [editor],
  );

  const toggleBulletList = useCallback(() => {
    if (isBulletList) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      if (isNumberedList) {
        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      }
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    }
  }, [editor, isBulletList, isNumberedList]);

  const toggleNumberedList = useCallback(() => {
    if (isNumberedList) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      if (isBulletList) {
        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      }
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }
  }, [editor, isNumberedList, isBulletList]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        1,
      ),
      editor.registerCommand(
        KEY_MODIFIER_COMMAND,
        (payload) => {
          const event = payload as KeyboardEvent;
          if (event.key === 'k') {
            event.preventDefault();
            insertLink();
            return true;
          }
          return false;
        },
        1,
      ),
    );
  }, [editor, updateToolbar, insertLink]);

  return {
    isBold,
    isItalic,
    isUnderline,
    isCode,
    isCodeBlock,
    isLink,
    linkUrl,
    setLinkUrl,
    isPopoverOpen,
    setIsPopoverOpen,
    isEditable,
    selectedFont,
    blockType,
    isBulletList,
    isNumberedList,
    fontsConfig,
    insertLink,
    onLinkSubmit,
    handleFontChange,
    handleBlockTypeChange,
    toggleBulletList,
    toggleNumberedList,
    editor,
  };
}
