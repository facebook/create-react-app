var fs = require('fs-extra');
module.exports = function copyPublicFolder(appPublic, appBuild, appHtml) {
  fs.copySync(appPublic, appBuild, {
    dereference: true,
    filter: file => file !== appHtml
  });
};
