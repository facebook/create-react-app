// @remove-on-eject-begin
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';
const fs = require('fs');
const path = require('path');
const merge = require('lodash.merge');
const JSON5 = require('json5');
const paths = require('./paths');
const hasJsxRuntime = require('./hasJsxRuntime');
const browserslist = require('browserslist');

const targets = browserslist.loadConfig({ path: paths.appPath });

module.exports = function createSwcConfig({
  shouldUseSourceMap = true,
  isEnvDevelopment = false,
  isEnvProduction = false,
  shouldUseReactRefresh = false,
} = {}) {
  const projectSwcConfig = mapProjectConfigToSwcConfig(getProjectConfig());

  const generalOptions = {
    jsx: true,
    runtime: hasJsxRuntime ? 'automatic' : 'clasic',
    sourceMaps: shouldUseSourceMap,
    refresh: shouldUseReactRefresh,
    useBrowserslist: isEnvDevelopment | isEnvProduction,
    development: isEnvDevelopment,
  };

  return {
    ecmascript: merge(
      {},
      projectSwcConfig,
      getBaseConfiguration({
        ...generalOptions,
      })
    ),
    typescript: merge(
      {},
      projectSwcConfig,
      getBaseConfiguration({
        ...generalOptions,
        syntax: 'typescript',
      })
    ),
  };
};

function getBaseConfiguration({
  runtime = 'clasic',
  syntax = 'ecmascript',
  jsx = false,
  sourceMaps = false,
  refresh = false,
  useBrowserslist = false,
  development = false,
}) {
  return {
    sourceMaps,
    jsc: {
      parser: {
        [syntax === 'typescript' ? 'tsx' : 'jsx']: jsx,
        syntax,
      },
      transform: {
        react: {
          runtime,
          refresh,
          development,
        },
      },
    },
    env: useBrowserslist
      ? {
          targets,
          mode: 'entry',
          coreJs: 3,
        }
      : {},
  };
}

function mapProjectConfigToSwcConfig(projectConfig = {}) {
  const {
    compilerOptions: {
      target,
      importHelpers,
      experimentalDecorators,
      emitDecoratorMetadata,
      baseUrl,
      paths,
    } = {},
  } = projectConfig;
  const result = { jsc: { externalHelpers: true, parser: {}, transform: {} } };

  if (target != null) {
    result.jsc.target = target;
  }
  if (importHelpers != null) {
    result.jsc.externalHelpers = importHelpers;
  }
  if (experimentalDecorators != null) {
    result.jsc.parser.decorators = experimentalDecorators;
  }
  if (emitDecoratorMetadata != null) {
    result.jsc.transform.decoratorMetadata = emitDecoratorMetadata;
  }

  if (baseUrl != null) {
    result.jsc.baseUrl = baseUrl;
    if (paths != null) {
      result.jsc.paths = paths;
    }
  }

  return result;
}

function getProjectConfig(configPath, loadedPaths = []) {
  const configPaths =
    configPath != null ? [configPath] : [paths.appTsConfig, paths.appJsConfig];
  const [projectConfigPath] = configPaths.filter(p => fs.existsSync(p));
  if (projectConfigPath == null) {
    return {};
  }
  if (loadedPaths.includes(projectConfigPath)) {
    return {};
  }
  try {
    const projectConfig = JSON5.parse(
      fs.readFileSync(projectConfigPath, 'utf-8')
    );
    if (projectConfig.extends != null) {
      const baseConfig = require.resolve(projectConfig.extends, {
        paths: [path.dirname(projectConfigPath)],
      });
      delete projectConfig.extends;
      return merge(
        getProjectConfig(baseConfig, [...loadedPaths, projectConfigPath]),
        projectConfig
      );
    }
    return projectConfig;
  } catch (error) {
    console.error(
      `Error: Failed to load "${projectConfigPath}", error: "${error.message}"`
    );
    process.exit(1);
  }
}
