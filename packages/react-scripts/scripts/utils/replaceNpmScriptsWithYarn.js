'use strict';

const replaceNpmScriptsWithYarn = scripts => {
  return Object.entries(scripts).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: value.replace(/(npm run |npm )/g, 'yarn '),
    }),
    {}
  );
};

module.exports = replaceNpmScriptsWithYarn;
