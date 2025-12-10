#!/usr/bin/env node

import('../dist/index.mjs').then(({ run }) => {
  run();
});
