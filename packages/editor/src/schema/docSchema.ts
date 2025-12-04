/**
 * Represents the type of a node in the editor document.
 */
export type NodeType =
  | 'doc'
  | 'paragraph'
  | 'heading'
  | 'bullet_list'
  | 'ordered_list'
  | 'list_item'
  | 'image'
  | 'link'
  | 'code_block'
  | 'text';

/**
 * Represents the type of a mark in the editor document.
 */
export type MarkType = 'bold' | 'italic' | 'underline' | 'code' | 'link';

/**
 * Represents a mark applied to a text node.
 */
export interface Mark {
  /** The type of the mark. */
  type: MarkType;
  /** Optional attributes associated with the mark. */
  attrs?: {
    href?: string;
    target?: string;
    [key: string]: unknown;
  };
}

/**
 * Base interface for all nodes in the editor document.
 */
export interface BaseNode {
  /** The type of the node. */
  type: NodeType;
  /** Optional attributes associated with the node. */
  attrs?: Record<string, unknown>;
  /** Optional marks applied to the node (typically for inline nodes). */
  marks?: Mark[];
}

/**
 * Represents a node that can contain other nodes.
 */
export interface ParentNode extends BaseNode {
  /** The content of the node, which is an array of child nodes. */
  content?: DocNode[];
}

/**
 * Represents a text node.
 */
export interface TextNode extends BaseNode {
  type: 'text';
  /** The text content. */
  text: string;
}

/**
 * Represents the root document node.
 */
export interface Doc extends ParentNode {
  type: 'doc';
}

/**
 * Represents a paragraph node.
 */
export interface Paragraph extends ParentNode {
  type: 'paragraph';
  attrs?: {
    /** The font ID to apply to this paragraph. */
    fontId?: string;
  };
}

/**
 * Represents a heading node.
 */
export interface Heading extends ParentNode {
  type: 'heading';
  attrs: {
    /** The level of the heading (1-6). */
    level: number;
    /** The font ID to apply to this heading. */
    fontId?: string;
  };
}

/**
 * Represents a bullet list node.
 */
export interface BulletList extends ParentNode {
  type: 'bullet_list';
}

/**
 * Represents an ordered list node.
 */
export interface OrderedList extends ParentNode {
  type: 'ordered_list';
  attrs?: {
    /** The starting number of the list. */
    start?: number;
  };
}

/**
 * Represents a list item node.
 */
export interface ListItem extends ParentNode {
  type: 'list_item';
  attrs?: {
    /** The font ID to apply to this list item. */
    fontId?: string;
  };
}

/**
 * Represents an image node.
 */
export interface Image extends BaseNode {
  type: 'image';
  attrs: {
    /** The source URL of the image. */
    src: string;
    /** The alt text of the image. */
    alt?: string;
    /** The title of the image. */
    title?: string;
  };
}

/**
 * Represents a link node.
 */
export interface Link extends ParentNode {
  type: 'link';
  attrs: {
    /** The URL of the link. */
    href: string;
    /** The target of the link (e.g. _blank). */
    target?: string;
    /** The title of the link. */
    title?: string;
  };
}

/**
 * Represents a code block node.
 */
export interface CodeBlock extends ParentNode {
  type: 'code_block';
  attrs?: {
    /** The language of the code block. */
    language?: string;
  };
}

/**
 * Union type representing any node in the editor document.
 */
export type DocNode =
  | Doc
  | Paragraph
  | Heading
  | BulletList
  | OrderedList
  | ListItem
  | Image
  | Link
  | CodeBlock
  | TextNode;
