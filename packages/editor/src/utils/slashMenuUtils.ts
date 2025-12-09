/**
 * Pure utility functions for SlashMenu.
 * These are extracted from SlashMenuPlugin for testability.
 */

export interface SlashMenuState {
  isOpen: boolean;
  query: string;
  position: { top: number; left: number };
  triggerNodeKey: string | null;
  triggerOffset: number;
}

export interface ModalState {
  isOpen: boolean;
  type: string | null;
  position: { top: number; left: number };
}

export const initialSlashMenuState: SlashMenuState = {
  isOpen: false,
  query: '',
  position: { top: 0, left: 0 },
  triggerNodeKey: null,
  triggerOffset: 0,
};

export const initialModalState: ModalState = {
  isOpen: false,
  type: null,
  position: { top: 0, left: 0 },
};

/**
 * Calculate the text content after removing slash and query.
 * @param textContent - The original text content
 * @param offset - The offset where the slash was typed
 * @param queryLength - The length of the query after the slash
 * @returns Object with beforeSlash and afterQuery parts
 */
export function calculateSlashRemoval(
  textContent: string,
  offset: number,
  queryLength: number,
): { beforeSlash: string; afterQuery: string; isEmpty: boolean } {
  const beforeSlash = textContent.substring(0, offset);
  const afterQuery = textContent.substring(offset + 1 + queryLength);
  return {
    beforeSlash,
    afterQuery,
    isEmpty: beforeSlash + afterQuery === '',
  };
}

/**
 * Determine if a command requires a modal UI.
 * @param modalType - The modal type from the command
 * @returns True if the command should open a modal
 */
export function shouldOpenModal(modalType: string | undefined): boolean {
  return modalType !== undefined && modalType !== 'none';
}

/**
 * Check if a character triggers the slash menu.
 * Slash menu should open when '/' is typed at start of line or after whitespace.
 * @param char - The character typed
 * @param textBeforeCursor - Text before the cursor position
 * @returns True if slash menu should open
 */
export function isSlashTrigger(
  char: string,
  textBeforeCursor: string,
): boolean {
  if (char !== '/') return false;
  // Open if at start or after whitespace
  return textBeforeCursor === '' || /\s$/.test(textBeforeCursor);
}

/**
 * Check if the current key should close the slash menu.
 * @param key - The key pressed
 * @returns True if the key should close the menu
 */
export function isMenuCloseKey(key: string): boolean {
  return key === 'Escape' || key === ' ';
}

/**
 * Check if the key should navigate the menu.
 * @param key - The key pressed
 * @returns 'up', 'down', 'select', or null
 */
export function getMenuNavigationAction(
  key: string,
): 'up' | 'down' | 'select' | null {
  switch (key) {
    case 'ArrowUp':
      return 'up';
    case 'ArrowDown':
      return 'down';
    case 'Enter':
    case 'Tab':
      return 'select';
    default:
      return null;
  }
}

/**
 * Calculate position for slash menu popup.
 * @param rect - The bounding rect of the selection
 * @param offset - Optional offset from the rect
 * @returns Position object with top and left
 */
export function calculateMenuPosition(
  rect: { bottom: number; left: number } | null,
  offset: { top?: number; left?: number } = {},
): { top: number; left: number } {
  if (!rect) return { top: 0, left: 0 };
  return {
    top: rect.bottom + (offset.top ?? 4),
    left: rect.left + (offset.left ?? 0),
  };
}

/**
 * Extract query from text after slash.
 * @param text - Full text content
 * @param slashOffset - Offset where slash was typed
 * @param cursorOffset - Current cursor offset
 * @returns The query string after the slash
 */
export function extractQueryFromText(
  text: string,
  slashOffset: number,
  cursorOffset: number,
): string {
  if (cursorOffset <= slashOffset) return '';
  return text.substring(slashOffset + 1, cursorOffset);
}

/**
 * Check if a query is valid (doesn't contain spaces).
 * Query becomes invalid when user types a space.
 * @param query - The current query string
 * @returns True if query is valid
 */
export function isValidSlashQuery(query: string): boolean {
  return !query.includes(' ');
}

/**
 * Check if cursor has moved before the slash position.
 * This indicates the menu should close.
 * @param cursorOffset - Current cursor offset
 * @param slashOffset - The offset where slash was typed
 * @returns True if menu should close due to cursor position
 */
export function shouldCloseOnCursorMove(
  cursorOffset: number,
  slashOffset: number,
): boolean {
  return cursorOffset <= slashOffset;
}

/**
 * Check if slash character is still present at expected position.
 * @param text - Current text content
 * @param slashOffset - Expected slash position
 * @returns True if slash is still at expected position
 */
export function isSlashStillPresent(
  text: string,
  slashOffset: number,
): boolean {
  return text[slashOffset] === '/';
}

/**
 * Calculate fallback position from element rect when selection rect is empty.
 * @param elementRect - The element's bounding rect
 * @param lineHeightOffset - Offset to add for line height (default 20)
 * @returns Position object with top and left
 */
export function calculateFallbackPosition(
  elementRect: { top: number; left: number } | null,
  lineHeightOffset: number = 20,
): { top: number; left: number } {
  if (!elementRect) return { top: 0, left: 0 };
  return {
    top: elementRect.top + lineHeightOffset,
    left: elementRect.left,
  };
}

/**
 * Check if a bounding rect is effectively empty (has no dimensions).
 * @param rect - The bounding rect to check
 * @returns True if rect has no width and height
 */
export function isEmptyRect(
  rect: { width: number; height: number } | null,
): boolean {
  if (!rect) return true;
  return rect.width === 0 && rect.height === 0;
}

/**
 * Check if slash menu should be triggered based on cursor position.
 * @param offset - The cursor offset in text
 * @param textBeforeCursor - Text content before cursor
 * @returns True if at start or after whitespace
 */
export function shouldTriggerSlashMenu(
  offset: number,
  textBeforeCursor: string,
): boolean {
  if (offset === 0) return true;
  if (textBeforeCursor.length === 0) return true;
  // Check if last char before cursor is whitespace
  const lastChar = textBeforeCursor[textBeforeCursor.length - 1];
  return /\s/.test(lastChar);
}

/**
 * Get detailed slash position information.
 * @param textContent - The text content
 * @param offset - The cursor offset
 * @returns Object with isAtStart and isAfterWhitespace
 */
export function getSlashPosition(
  textContent: string,
  offset: number,
): { isAtStart: boolean; isAfterWhitespace: boolean } {
  const isAtStart = offset === 0;
  const isAfterWhitespace =
    !isAtStart && offset > 0 && /\s/.test(textContent[offset - 1]);
  return { isAtStart, isAfterWhitespace };
}

/**
 * Extract query with cursor position and validate it.
 * @param text - Full text content
 * @param slashOffset - Offset where slash is
 * @param cursorOffset - Current cursor offset
 * @returns Object with query string and isValid flag
 */
export function extractQueryWithCursor(
  text: string,
  slashOffset: number,
  cursorOffset: number,
): { query: string; isValid: boolean } {
  // If cursor is at or before slash, invalid
  if (cursorOffset <= slashOffset) {
    return { query: '', isValid: false };
  }
  const query = text.substring(slashOffset + 1, cursorOffset);
  const isValid = !query.includes(' ');
  return { query, isValid };
}

/**
 * Validate if the current query update should close the menu.
 * @param currentOffset - Current cursor position
 * @param slashIndex - Position of the slash
 * @param query - The extracted query
 * @returns Object with shouldClose and reason
 */
export function validateQueryUpdate(
  currentOffset: number,
  slashIndex: number,
  query: string,
): {
  shouldClose: boolean;
  reason: 'cursor_before_slash' | 'space_in_query' | 'valid';
} {
  if (currentOffset <= slashIndex) {
    return { shouldClose: true, reason: 'cursor_before_slash' };
  }
  if (query.includes(' ')) {
    return { shouldClose: true, reason: 'space_in_query' };
  }
  return { shouldClose: false, reason: 'valid' };
}

/**
 * Get the corrected slash index when working with element nodes.
 * @param isElementNode - Whether the node is an element
 * @param originalOffset - Original trigger offset
 * @returns Corrected slash index
 */
export function getCorrectedSlashIndex(
  isElementNode: boolean,
  originalOffset: number,
): number {
  return isElementNode ? 0 : originalOffset;
}

/**
 * Check if selection is in valid node for slash menu.
 * @param selectionNodeKey - Key of selection anchor node
 * @param triggerNodeKey - Key of original trigger node
 * @param textNodeKey - Key of text node (if different from trigger)
 * @param isTextNode - Whether selection is on a text node
 * @returns True if selection is in valid position
 */
export function isSelectionInValidNode(
  selectionNodeKey: string,
  triggerNodeKey: string,
  textNodeKey: string | null,
  isTextNode: boolean,
): boolean {
  const isInTrigger = selectionNodeKey === triggerNodeKey;
  const isInTextChild =
    isTextNode && textNodeKey !== null && selectionNodeKey === textNodeKey;
  return isInTrigger || isInTextChild;
}

/**
 * Get menu position with offset from rect.
 * @param rect - Bounding client rect
 * @param verticalOffset - Vertical offset (default 4)
 * @returns Position object
 */
export function getMenuPositionFromRect(
  rect: { bottom: number; left: number },
  verticalOffset: number = 4,
): { top: number; left: number } {
  return {
    top: rect.bottom + verticalOffset,
    left: rect.left,
  };
}

/**
 * Get menu position from element with line height offset.
 * @param elementRect - Element bounding rect
 * @param lineHeightOffset - Line height offset (default 20)
 * @returns Position object
 */
export function getMenuPositionFromElement(
  elementRect: { top: number; left: number },
  lineHeightOffset: number = 20,
): { top: number; left: number } {
  return {
    top: elementRect.top + lineHeightOffset,
    left: elementRect.left,
  };
}

/**
 * Input for query update processing.
 * Contains all the data needed to determine query update or menu close.
 */
export interface QueryUpdateInput {
  /** Whether the node was found */
  nodeExists: boolean;
  /** Whether the node is an element (vs text) */
  isElementNode: boolean;
  /** Whether the element has a text child */
  hasTextChild: boolean;
  /** The text content of the relevant node */
  textContent: string;
  /** The original trigger offset */
  triggerOffset: number;
  /** The trigger node key */
  triggerNodeKey: string;
  /** Whether we have a valid range selection */
  hasValidSelection: boolean;
  /** The selection anchor node key */
  selectionNodeKey: string;
  /** The text node key (if it's a text child of element) */
  textNodeKey: string | null;
  /** Whether selection is on a text node */
  selectionIsTextNode: boolean;
  /** Current cursor offset */
  cursorOffset: number;
}

/**
 * Result of query update processing.
 */
export interface QueryUpdateResult {
  /** Whether to update the query */
  shouldUpdate: boolean;
  /** Whether to close the menu */
  shouldClose: boolean;
  /** The new query (if shouldUpdate is true) */
  query: string;
  /** Reason for closing (for debugging) */
  closeReason?: string;
}

/**
 * Process a query update from editor state.
 * This is a pure function that encapsulates all the logic for determining
 * whether to update the query, close the menu, or do nothing.
 *
 * @param input - All the data needed for processing
 * @returns Result indicating what action to take
 */
export function processQueryUpdate(input: QueryUpdateInput): QueryUpdateResult {
  // No node found - close menu
  if (!input.nodeExists) {
    return {
      shouldUpdate: false,
      shouldClose: true,
      query: '',
      closeReason: 'node_not_found',
    };
  }

  // Determine the slash index based on node type
  let slashIndex = input.triggerOffset;

  if (input.isElementNode) {
    if (!input.hasTextChild) {
      // No text child yet, menu should stay open waiting for text
      return { shouldUpdate: false, shouldClose: false, query: '' };
    }
    // For element nodes, slash is at position 0 in the text child
    slashIndex = getCorrectedSlashIndex(true, input.triggerOffset);
  }

  // Check if slash is still there
  if (!isSlashStillPresent(input.textContent, slashIndex)) {
    return {
      shouldUpdate: false,
      shouldClose: true,
      query: '',
      closeReason: 'slash_removed',
    };
  }

  // Validate selection
  if (!input.hasValidSelection) {
    return {
      shouldUpdate: false,
      shouldClose: true,
      query: '',
      closeReason: 'invalid_selection',
    };
  }

  // Check if selection is in valid node
  const isValid = isSelectionInValidNode(
    input.selectionNodeKey,
    input.triggerNodeKey,
    input.textNodeKey,
    input.selectionIsTextNode,
  );

  if (!isValid) {
    return {
      shouldUpdate: false,
      shouldClose: true,
      query: '',
      closeReason: 'selection_moved',
    };
  }

  // Extract and validate query
  const { query, isValid: queryValid } = extractQueryWithCursor(
    input.textContent,
    slashIndex,
    input.cursorOffset,
  );

  if (!queryValid) {
    return {
      shouldUpdate: false,
      shouldClose: true,
      query: '',
      closeReason: 'invalid_query',
    };
  }

  return { shouldUpdate: true, shouldClose: false, query };
}
