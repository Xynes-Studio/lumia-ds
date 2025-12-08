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
export function isSlashTrigger(char: string, textBeforeCursor: string): boolean {
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
