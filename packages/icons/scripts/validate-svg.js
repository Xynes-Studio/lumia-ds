// @ts-check
const { parseSvg } = require('../../cli/bin/lib/svg-import');

/** SVGR plugin: reject unsupported XML before SVGO or JSX conversion.
 * @param {string} source
 */
module.exports = function validateSvg(source) {
  parseSvg(source);
  return source;
};
