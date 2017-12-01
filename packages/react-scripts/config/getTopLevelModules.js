'use strict';

const path = require('path');
const paths = require('./paths');

const mapDependenciesToFolder = (dependencies, folder) =>
  dependencies.reduce(
    (accumulator, dependency) =>
      Object.assign(
        {},
        {
          [dependency]: path.resolve(folder, dependency),
        },
        accumulator
      ),
    {}
  );

const topLevelModuleNames = () => {
  const config = process.env.TOP_LEVEL_MODULES;
  if (config) {
    if (config.toLowerCase() === 'true') {
      // return defaults
      return ['react', 'react-dom'];
    }

    let json;
    try {
      json = JSON.parse(config);
    } catch (e) {
      // continue regardless of error
    }

    if (Array.isArray(json)) {
      return json;
    } else {
      return config;
    }
  }
};

const getTopLevelModules = () => {
  const modulesNames = topLevelModuleNames();
  if (modulesNames) {
    mapDependenciesToFolder(modulesNames, paths.appNodeModules);
  }
  return {};
};

module.exports = getTopLevelModules;
