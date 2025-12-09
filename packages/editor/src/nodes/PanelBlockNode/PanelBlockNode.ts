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

    // Icon - always create for variant-based CSS styling
    const iconDiv = document.createElement('div');
    iconDiv.className = 'panel-icon';
    iconDiv.contentEditable = 'false';
    iconDiv.dataset.icon = this.__icon || this.__variant;
    div.appendChild(iconDiv);

    // Title - static display, edit via Panel Inspector or Action Menu
    if (this.__title) {
      const titleDiv = document.createElement('div');
      titleDiv.className = 'panel-title';
      titleDiv.contentEditable = 'false';
      titleDiv.textContent = this.__title;
      div.appendChild(titleDiv);
    }

    return div;
  }

  updateDOM(prevNode: PanelBlockNode, dom: HTMLElement): boolean {
    // Update variant class
    if (prevNode.__variant !== this.__variant) {
      dom.classList.remove(prevNode.__variant);
      dom.classList.add(this.__variant);
    }

    // Update icon
    const iconDiv = dom.querySelector('.panel-icon') as HTMLElement | null;
    if (iconDiv) {
      iconDiv.dataset.icon = this.__icon || this.__variant;
    }

    // For title changes, force re-render to avoid complex DOM manipulation
    if (prevNode.__title !== this.__title) {
      return true;
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
   * Allows the panel to be converted or have its content extracted.
   */
  collapseAtStart(): boolean {
    // If the panel is empty, convert it to a paragraph
    if (this.isEmpty()) {
      const paragraph = $createParagraphNode();
      this.replace(paragraph);
      paragraph.select();
      return true;
    }
    return false;
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
