var packageJsonMd5 = require('./packageJsonMd5');
var vendorManifestId = [process.env.NODE_ENV, packageJsonMd5].join('_');
module.exports = process.env.REACT_APP_VENDOR_MANIFEST_ID = vendorManifestId

