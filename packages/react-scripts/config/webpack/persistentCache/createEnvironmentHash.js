'use strict';
const { createHash } = require('crypto');

module.exports = env => {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(env));

  return hash.digest('hex');
};
