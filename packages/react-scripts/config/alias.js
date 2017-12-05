const paths = require('./paths');
const appPackageJson = require(paths.appPackageJson);
const definedAliases = appPackageJson.alias || [];

if (!Array.isArray(definedAliases)) {
  throw new Error('Your alias declaration must be an array');
}

const alias = definedAliases.reduce((accum, current) => {
  if (current.expose && current.source) {
    accum[current.expose] = current.source;
  }
  return accum;
}, {});

module.exports = alias;
