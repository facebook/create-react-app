'use strict';
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const paths = require('../config/paths');
const hash = crypto.createHash('md5');
const input = fs.readFileSync(path.join(paths.vendorPath, 'index.js'));
const appPackageJson = fs.readFileSync(paths.appPackageJson);

hash.update(input);
hash.update(appPackageJson);

const hashed = hash.digest('hex');
module.exports = (process.env.REACT_APP_VENDOR_HASH = [
  process.env.NODE_ENV,
  hashed,
].join('.'));
