import {
  EditorConfig,
  ElementNode,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread,
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

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    const className = config.theme.panel || 'panel-node';
    div.className = `${className} ${this.__variant}`;

    // Icon
    if (this.__icon) {
      // Ideally we would render an SVG or Icon component here.
      // For now, we'll create a placeholder that can be styled or replaced.
      // Since this is a simple DOM node, we can't easily use React components without a NodeView.
      // We'll add a data attribute or class for the icon.
      const iconDiv = document.createElement('div');
      iconDiv.className = 'panel-icon';
      iconDiv.contentEditable = 'false';
      // We can maybe put the icon name in text if needed, or handle it via CSS background.
      // Or, if we want to use Lucide icons, `createDOM` is synchronous and non-React.
      // We might need to map icon names to SVGs here if we want them to show up without React.
      // However, the prompt says "Component renders a coloured container...".
      // If strict React rendering is required effectively, we would need a DecoratorNode with a NestedEditor.
      // But assuming ElementNode is preferred for content, we'll stick to DOM.

      // Let's rely on CSS mapping for standard icons (info/check/alert) if possible,
      // or just put the icon name in a data attribute.
      iconDiv.dataset.icon = this.__icon;
      div.appendChild(iconDiv);
    }

    // Title
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
    if (prevNode.__variant !== this.__variant) {
      dom.classList.remove(prevNode.__variant);
      dom.classList.add(this.__variant);
    }
    // Updating title/icon requires DOM manipulation if they changed.
    // It's often easier to return true to force standard re-render,
    // but ElementNode re-render might lose focus/selection state if not careful?
    // Actually ElementNode defaults to returning false.
    // If we want to support dynamic title/icon updates without full re-render:
    if (prevNode.__title !== this.__title || prevNode.__icon !== this.__icon) {
      return true; // Force re-render for simplicity
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
