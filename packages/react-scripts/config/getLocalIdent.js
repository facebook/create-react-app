'use strict';

const getLocalIdent = require('css-loader/lib/getLocalIdent');

const paths = require('./paths');
const pkgJson = require(paths.appPackageJson);

module.exports = (context, localIdentName, localName, options) => {
  const customOptions = {};

  if (pkgJson.name) {
    customOptions.hashPrefix = pkgJson.name;
  }

  return getLocalIdent(
    context,
    localIdentName,
    localName,
    Object.assign(options, customOptions)
  );
};
