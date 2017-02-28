var crypto = require('crypto');
var fs = require('fs');
var path = require('path')
var paths = require('../config/paths');
var hash = crypto.createHash('md5');
var input = fs.readFileSync(path.join(paths.vendorPath, 'index.js'));
hash.update(input);

var hashed = hash.digest('hex');
module.exports = 
process.env.REACT_APP_VENDOR_HASH = 
[process.env.NODE_ENV, hashed].join('.');

