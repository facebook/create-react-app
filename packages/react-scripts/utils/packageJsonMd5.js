var crypto = require('crypto');
var fs = require('fs');
var paths = require('../config/paths');
var hash = crypto.createHash('md5');
var input = fs.readFileSync(paths.appPackageJson);
hash.update(input);

module.exports = hash.digest('hex');
