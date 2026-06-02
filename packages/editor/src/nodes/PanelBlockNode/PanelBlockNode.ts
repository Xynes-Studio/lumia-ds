import {
  EditorConfig,
  ElementNode,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread,
  RangeSelection,
  $createParagraphNode,
  ParagraphNode,
} from 'lexical';

export type PanelVariant = 'info' | 'warning' | 'success' | 'note';

export interface PanelBlockPayload {
  variant?: PanelVariant;
  title?: string;
  icon?: string;
  key?: NodeKey;
}

export type SerializedPanelBlockNode = Spread<
  {
    variant: PanelVariant;
    title?: string;
    icon?: string;
  },
  SerializedElementNode
>;

export class PanelBlockNode extends ElementNode {
  __variant: PanelVariant;
  __title?: string;
  __icon?: string;

  static getType(): string {
    return 'panel-block';
  }

  static clone(node: PanelBlockNode): PanelBlockNode {
    return new PanelBlockNode(
      node.__variant,
      node.__title,
      node.__icon,
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedPanelBlockNode): PanelBlockNode {
    const { variant, title, icon } = serializedNode;
    const node = $createPanelBlockNode({
      variant,
      title,
      icon,
    });
    return node;
  }

  exportJSON(): SerializedPanelBlockNode {
    return {
      ...super.exportJSON(),
      variant: this.__variant,
      title: this.__title,
      icon: this.__icon,
      type: 'panel-block',
      version: 1,
    };
  }

  constructor(
    variant: PanelVariant = 'info',
    title?: string,
    icon?: string,
    key?: NodeKey,
  ) {
    super(key);
    this.__variant = variant;
    this.__title = title;
    this.__icon = icon;
  }

  getVariant(): PanelVariant {
    return this.__variant;
  }

  setVariant(variant: PanelVariant): void {
    const self = this.getWritable();
    self.__variant = variant;
  }

  getTitle(): string | undefined {
    return this.__title;
  }

  setTitle(title: string | undefined): void {
    const self = this.getWritable();
    self.__title = title;
  }

  getIcon(): string | undefined {
    return this.__icon;
  }

  setIcon(icon: string | undefined): void {
    const self = this.getWritable();
    self.__icon = icon;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    const className = config.theme.panel || 'panel-node';
    div.className = `${className} ${this.__variant}`;
    // BUG-LDS-6 (Path 2): the panel DOM is intentionally minimal — no
    // chrome / icon / title children inside. The variant icon trigger
    // is rendered by `PanelActionMenuPlugin` as an absolutely-positioned
    // SIBLING overlay (outside the contenteditable), so Lexical's
    // reconciler never sees it and cannot wipe it. The title text lives
    // inside the popover only (not in the canvas).
    return div;
  }

  updateDOM(prevNode: PanelBlockNode, dom: HTMLElement): boolean {
    // BUG-LDS-6 (Path 2): only the variant class affects the panel DOM.
    // The variant icon + title are React-managed in the sibling overlay
    // layer, so updateDOM has nothing to do for icon / title changes.
    if (prevNode.__variant !== this.__variant) {
      dom.classList.remove(prevNode.__variant);
      dom.classList.add(this.__variant);
    }
    return false;
  }

  /**
   * Called when Enter key is pressed.
   * When at the end of the panel's content, pressing Enter exits the panel
   * and creates a new paragraph after it.
   */
  insertNewAfter(
    selection?: RangeSelection,
    restoreSelection = true,
  ): ParagraphNode | null {
    const anchorOffset = selection ? selection.anchor.offset : 0;
    const lastDescendant = this.getLastDescendant();

    // Check if cursor is at the end of the panel's content
    const isAtEnd =
      !lastDescendant ||
      (selection &&
        selection.anchor.key === lastDescendant.getKey() &&
        anchorOffset === lastDescendant.getTextContentSize());

    if (isAtEnd) {
      // Exit the panel: create a new paragraph after the panel
      const newParagraph = $createParagraphNode();
      const direction = this.getDirection();
      newParagraph.setDirection(direction);
      this.insertAfter(newParagraph, restoreSelection);
      return newParagraph;
    }

    // Not at end - let default behavior handle it (create new line inside panel)
    return null;
  }

  /**
   * Called when backspace is pressed at the start of the first child.
   *
   * BUG-LDS-6: A panel that contains only an empty paragraph is the most
   * common "stale" state (just inserted, never typed in, or all content
   * deleted). Previously `this.isEmpty()` returned `false` in that case
   * because the panel still wrapped a paragraph child, so backspace had no
   * effect — the panel was un-removable. We now also treat the
   * "single empty paragraph child" shape as effectively empty and convert
   * the whole panel to a plain paragraph (preserving the user's caret).
   */
  collapseAtStart(): boolean {
    if (this.isEmpty() || this.hasOnlyEmptyParagraph()) {
      const paragraph = $createParagraphNode();
      this.replace(paragraph);
      paragraph.select();
      return true;
    }
    return false;
  }

  /**
   * Returns true when the panel's only child is an empty paragraph node.
   * Used by `collapseAtStart` so authors can backspace away a freshly
   * inserted (and never edited) panel without manually selecting it.
   */
  private hasOnlyEmptyParagraph(): boolean {
    const children = this.getChildren();
    if (children.length !== 1) return false;
    const only = children[0];
    if (!only) return false;
    if (only.getType() !== 'paragraph') return false;
    // `getTextContentSize` includes all descendant text; zero means empty.
    return only.getTextContentSize() === 0;
  }
}

export function $createPanelBlockNode({
  variant,
  title,
  icon,
  key,
}: PanelBlockPayload): PanelBlockNode {
  return new PanelBlockNode(variant, title, icon, key);
}

export function $isPanelBlockNode(
  node: LexicalNode | null | undefined,
): node is PanelBlockNode {
  return node instanceof PanelBlockNode;
}
