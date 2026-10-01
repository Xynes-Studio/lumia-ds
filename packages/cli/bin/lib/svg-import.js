// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { SaxesParser } = require('saxes');

/** @typedef {{ name: string, attributes: Record<string, string>, children: (SvgNode | string)[] }} SvgNode */
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const MAX_BYTES = 1024 * 1024;
const MAX_NODES = 4096;
const MAX_DEPTH = 32;
const ELEMENTS = new Set([
  'svg',
  'g',
  'path',
  'rect',
  'circle',
  'ellipse',
  'line',
  'polyline',
  'polygon',
  'title',
  'desc',
  'defs',
  'linearGradient',
  'radialGradient',
  'stop',
  'clipPath',
  'mask',
]);
const ATTRIBUTES = new Set([
  'id',
  'class',
  'viewBox',
  'width',
  'height',
  'preserveAspectRatio',
  'x',
  'y',
  'x1',
  'y1',
  'x2',
  'y2',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'd',
  'points',
  'fill',
  'fill-rule',
  'fill-opacity',
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-opacity',
  'opacity',
  'color',
  'transform',
  'vector-effect',
  'clip-path',
  'clip-rule',
  'clipPathUnits',
  'mask',
  'maskUnits',
  'maskContentUnits',
  'gradientUnits',
  'gradientTransform',
  'spreadMethod',
  'offset',
  'stop-color',
  'stop-opacity',
  'fx',
  'fy',
  'fr',
  'role',
  'aria-label',
  'aria-hidden',
  'aria-labelledby',
  'aria-describedby',
  'focusable',
]);
const ID = /^[A-Za-z_][A-Za-z0-9_.-]{0,127}$/;
const LOCAL_URL = /^url\(#[A-Za-z_][A-Za-z0-9_.-]{0,127}\)$/;
const COLOR =
  /^(?:[A-Za-z]{1,32}|#[\da-fA-F]{3,8}|(?:rgb|rgba|hsl|hsla)\([\d.,%+\-\s]+\))$/;

/** @param {string} value */
function assertLiteral(value) {
  if (value.includes('${'))
    throw new Error('SVG interpolation is not supported');
}

/** @param {string} name @param {string} value */
function validateAttribute(name, value) {
  assertLiteral(value);
  if (!ATTRIBUTES.has(name) || value.length > 16384) {
    throw new Error('Unsupported SVG attribute');
  }
  if (name === 'id' && !ID.test(value)) throw new Error('Invalid SVG id');
  if (
    ['fill', 'stroke', 'color', 'stop-color'].includes(name) &&
    !COLOR.test(value) &&
    !LOCAL_URL.test(value)
  ) {
    throw new Error('SVG paint must be a static color or local fragment');
  }
  if (
    ['clip-path', 'mask'].includes(name) &&
    value !== 'none' &&
    !LOCAL_URL.test(value)
  ) {
    throw new Error('SVG references must be local fragments');
  }
}

/** Strictly parse a bounded static SVG subset. No recovery, DTDs, or external resources.
 * @param {string} source
 * @returns {SvgNode}
 */
function parseSvg(source) {
  if (Buffer.byteLength(source, 'utf8') > MAX_BYTES)
    throw new Error('SVG exceeds 1 MiB');
  assertLiteral(source);
  const parser = new SaxesParser({
    xmlns: true,
    defaultXMLVersion: '1.0',
    forceXMLVersion: true,
  });
  /** @type {SvgNode[]} */
  const stack = [];
  /** @type {SvgNode[]} */
  const roots = [];
  let nodes = 0;
  parser.on('error', () => {
    throw new Error('Invalid SVG XML');
  });
  parser.on('doctype', () => {
    throw new Error('SVG document types are not supported');
  });
  parser.on('processinginstruction', () => {
    throw new Error('SVG processing instructions are not supported');
  });
  parser.on('opentag', (tag) => {
    if (
      tag.prefix ||
      (tag.uri && tag.uri !== SVG_NAMESPACE) ||
      !ELEMENTS.has(tag.name)
    ) {
      throw new Error('Unsupported SVG element or namespace');
    }
    if (++nodes > MAX_NODES || stack.length >= MAX_DEPTH)
      throw new Error('SVG complexity limit exceeded');
    if (
      (!stack.length && tag.name !== 'svg') ||
      (stack.length && tag.name === 'svg')
    ) {
      throw new Error('Expected a single SVG root');
    }
    /** @type {SvgNode} */
    const node = { name: tag.name, attributes: {}, children: [] };
    if (Object.keys(tag.attributes).length > 64)
      throw new Error('Too many SVG attributes');
    for (const attribute of Object.values(tag.attributes)) {
      if (
        attribute.name === 'xmlns' &&
        !stack.length &&
        attribute.value === SVG_NAMESPACE
      )
        continue;
      if (attribute.prefix || attribute.uri)
        throw new Error('Unsupported SVG attribute namespace');
      validateAttribute(attribute.name, attribute.value);
      node.attributes[attribute.name] = attribute.value;
    }
    const parent = stack[stack.length - 1];
    if (parent) parent.children.push(node);
    else roots.push(node);
    stack.push(node);
  });
  /** @param {string} text */
  const onText = (text) => {
    assertLiteral(text);
    const node = stack[stack.length - 1];
    if (!text.trim()) return;
    if (!node || !['title', 'desc'].includes(node.name))
      throw new Error('Unsupported SVG text content');
    node.children.push(text);
  };
  parser.on('text', onText);
  parser.on('cdata', onText);
  parser.on('closetag', () => {
    stack.pop();
  });
  parser.write(source).close();
  const root = roots[0];
  if (roots.length !== 1 || !root)
    throw new Error('Expected a single SVG root');
  root.attributes.viewBox ||= '0 0 24 24';
  root.attributes.xmlns = SVG_NAMESPACE;
  return root;
}

/** @param {string} name */
function jsxAttributeName(name) {
  if (name === 'class') return 'className';
  if (name.startsWith('aria-')) return name;
  return name.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

/** @param {Record<string, string>} attributes */
function propsLiteral(attributes) {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(attributes).map(([key, value]) => [
        jsxAttributeName(key),
        value,
      ]),
    ),
  );
}

/** @param {SvgNode | string} node @returns {string} */
function renderNode(node) {
  if (typeof node === 'string') return `{${JSON.stringify(node)}}`;
  const props = propsLiteral(node.attributes);
  return `<${node.name} {...${props}}>${node.children.map(renderNode).join('')}</${node.name}>`;
}

/** @param {string} name @param {SvgNode} svg */
function renderComponent(name, svg) {
  return `// Auto-generated by lumia-icon-import. Do not edit by hand.
import type { SVGProps } from 'react';

const svgProps = ${propsLiteral(svg.attributes)} as const;

export function ${name}(props: SVGProps<SVGSVGElement>) {
  return <svg {...svgProps} {...props}>${svg.children.map(renderNode).join('')}</svg>;
}

export default ${name};
`;
}

/** Read regular SVG files only, validating the full batch before output changes.
 * @param {string} directory
 */
function readSvgDirectory(directory) {
  const files = fs
    .readdirSync(directory)
    .filter((file) => file.toLowerCase().endsWith('.svg'))
    .sort();
  if (!files.length) throw new Error('No .svg files found');
  if (files.length > 256) throw new Error('SVG batch exceeds 256 files');
  let totalBytes = 0;
  return files.map((file) => {
    const baseName = path.parse(file).name;
    if (
      !/^[A-Za-z0-9][A-Za-z0-9 _-]*$/.test(baseName) ||
      baseName.length > 128
    ) {
      throw new Error(
        'SVG filenames must contain only letters, numbers, spaces, underscores, and hyphens',
      );
    }
    const svgPath = path.join(directory, file);
    if (!fs.lstatSync(svgPath).isFile())
      throw new Error('SVG must be a regular file');
    const fd = fs.openSync(
      svgPath,
      fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK,
    );
    let bytes;
    try {
      const stat = fs.fstatSync(fd);
      if (!stat.isFile() || stat.size > MAX_BYTES)
        throw new Error('SVG must be a regular file no larger than 1 MiB');
      const buffer = Buffer.alloc(MAX_BYTES + 1);
      let length = 0;
      let read;
      do {
        read = fs.readSync(fd, buffer, length, buffer.length - length, null);
        length += read;
      } while (read && length < buffer.length);
      if (length > MAX_BYTES) throw new Error('SVG exceeds 1 MiB');
      bytes = buffer.subarray(0, length);
    } finally {
      fs.closeSync(fd);
    }
    totalBytes += bytes.length;
    if (totalBytes > 16 * MAX_BYTES)
      throw new Error('SVG batch exceeds 16 MiB');
    const source = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return { file, baseName, svg: parseSvg(source) };
  });
}

module.exports = { parseSvg, renderComponent, readSvgDirectory };
