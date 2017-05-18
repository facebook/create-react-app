'use strict';
const crypto = require('crypto');
const fs = require('fs');
const paths = require('../../config/paths');
const hash = crypto.createHash('md5');

if (fs.existsSync(paths.vendorSrc)) {
  const input = fs.readFileSync(paths.vendorSrc);
  const appPackageJson = fs.readFileSync(paths.appPackageJson);

  hash.update(input);
  hash.update(appPackageJson);

  if (fs.existsSync(paths.yarnLockFile)) {
    hash.update(fs.readFileSync(paths.yarnLockFile));
  }

  const hashed = hash.digest('hex');
  module.exports = (process.env.REACT_APP_VENDOR_HASH = [
    process.env.NODE_ENV,
    hashed,
  ].join('.'));
} else {
  module.exports = false;
}
