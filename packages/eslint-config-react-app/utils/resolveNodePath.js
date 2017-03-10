'use strict';

function resolveNodePath() {
  const nodePaths = (process.env.NODE_PATH || '')
    .split(process.platform === 'win32' ? ';' : ':')
    .filter(Boolean);

  return nodePaths;
}

module.exports = resolveNodePath;
