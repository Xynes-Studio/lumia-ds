import { Schema } from 'prosemirror-model';

/**
 * ProseMirror schema definition that aligns with the DocNode structure.
 */
export const pmSchema = new Schema({
  nodes: {
    doc: {
      content: 'block+',
    },
    paragraph: {
      content: 'inline*',
      group: 'block',
      parseDOM: [{ tag: 'p' }],
      toDOM() {
        return ['p', 0];
      },
    },
    heading: {
      attrs: { level: { default: 1 } },
      content: 'inline*',
      group: 'block',
      defining: true,
      parseDOM: [
        { tag: 'h1', attrs: { level: 1 } },
        { tag: 'h2', attrs: { level: 2 } },
        { tag: 'h3', attrs: { level: 3 } },
        { tag: 'h4', attrs: { level: 4 } },
        { tag: 'h5', attrs: { level: 5 } },
        { tag: 'h6', attrs: { level: 6 } },
      ],
      toDOM(node) {
        return ['h' + node.attrs.level, 0];
      },
    },
    bullet_list: {
      content: 'list_item+',
      group: 'block',
      parseDOM: [{ tag: 'ul' }],
      toDOM() {
        return ['ul', 0];
      },
    },
    ordered_list: {
      content: 'list_item+',
      group: 'block',
      attrs: { order: { default: 1 } },
      parseDOM: [
        {
          tag: 'ol',
          getAttrs(dom) {
            return {
              order: (dom as HTMLElement).hasAttribute('start')
                ? +(dom as HTMLElement).getAttribute('start')!
                : 1,
            };
          },
        },
      ],
      toDOM(node) {
        return node.attrs.order === 1
          ? ['ol', 0]
          : ['ol', { start: node.attrs.order }, 0];
      },
    },
    list_item: {
      content: 'paragraph block*',
      parseDOM: [{ tag: 'li' }],
      toDOM() {
        return ['li', 0];
      },
      defining: true,
    },
    image: {
      inline: true,
      attrs: {
        src: {},
        alt: { default: null },
        title: { default: null },
      },
      group: 'inline',
      draggable: true,
      parseDOM: [
        {
          tag: 'img[src]',
          getAttrs(dom) {
            return {
              src: (dom as HTMLElement).getAttribute('src'),
              title: (dom as HTMLElement).getAttribute('title'),
              alt: (dom as HTMLElement).getAttribute('alt'),
            };
          },
        },
      ],
      toDOM(node) {
        const { src, alt, title } = node.attrs;
        return ['img', { src, alt, title }];
      },
    },
    link_node: {
      attrs: {
        href: {},
        title: { default: null },
        target: { default: '_blank' },
      },
      content: 'block+',
      group: 'block',
      parseDOM: [
        {
          tag: 'div[data-type="link"]',
          getAttrs(dom) {
            return {
              href: (dom as HTMLElement).getAttribute('data-href'),
              title: (dom as HTMLElement).getAttribute('title'),
              target: (dom as HTMLElement).getAttribute('target'),
            };
          },
        },
      ],
      toDOM(node) {
        const { href, title, target } = node.attrs;
        return [
          'div',
          { 'data-type': 'link', 'data-href': href, title, target },
          0,
        ];
      },
    },
    code_block: {
      content: 'text*',
      marks: '',
      group: 'block',
      code: true,
      defining: true,
      attrs: { language: { default: '' } },
      parseDOM: [
        {
          tag: 'pre',
          preserveWhitespace: 'full',
          getAttrs(dom) {
            return {
              language: (dom as HTMLElement).getAttribute('data-language'),
            };
          },
        },
      ],
      toDOM(node) {
        return ['pre', { 'data-language': node.attrs.language }, ['code', 0]];
      },
    },
    text: {
      group: 'inline',
    },
  },
  marks: {
    bold: {
      parseDOM: [
        { tag: 'strong' },
        {
          tag: 'b',
          getAttrs: (node) =>
            (node as HTMLElement).style.fontWeight !== 'normal' && null,
        },
        {
          style: 'font-weight',
          getAttrs: (value) =>
            /^(bold(er)?|[5-9]\d{2,})$/.test(value as string) && null,
        },
      ],
      toDOM() {
        return ['strong', 0];
      },
    },
    italic: {
      parseDOM: [{ tag: 'i' }, { tag: 'em' }, { style: 'font-style=italic' }],
      toDOM() {
        return ['em', 0];
      },
    },
    underline: {
      parseDOM: [{ tag: 'u' }, { style: 'text-decoration=underline' }],
      toDOM() {
        return ['u', 0];
      },
    },
    code: {
      parseDOM: [{ tag: 'code' }],
      toDOM() {
        return ['code', 0];
      },
    },
    link: {
      attrs: {
        href: {},
        title: { default: null },
        target: { default: '_blank' },
      },
      inclusive: false,
      parseDOM: [
        {
          tag: 'a[href]',
          getAttrs(dom) {
            return {
              href: (dom as HTMLElement).getAttribute('href'),
              title: (dom as HTMLElement).getAttribute('title'),
              target: (dom as HTMLElement).getAttribute('target'),
            };
          },
        },
      ],
      toDOM(node) {
        const { href, title, target } = node.attrs;
        return ['a', { href, title, target }, 0];
      },
    },
  },
});
