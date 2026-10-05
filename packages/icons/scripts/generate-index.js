#!/usr/bin/env node
// @ts-check
// Compatibility entry point: validation and generation cannot be skipped.
const { run } = require('./build-icons');
if (require.main === module) process.exitCode = run(process.argv.slice(2));
module.exports = { run };
