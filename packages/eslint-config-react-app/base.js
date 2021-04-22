/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

// This file contains the minimum ESLint configuration required for Create
// React App support, and is used as the `baseConfig` for `eslint-loader`
// to ensure that user-provided configs don't need this boilerplate.

module.exports = {
  root: true,

  parser: '@babel/eslint-parser',

  plugins: ['react'],

  env: {
    browser: true,
    commonjs: true,
    es6: true,
    jest: true,
    node: true,
  },

  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    requireConfigFile: false,
    babelOptions: {
      parserOpts: {
        plugins: [
          ['flow', { all: true, enums: true }],
          'jsx',
          // ES2022, remove these three when upgrading to Babel 7.14
          'classProperties',
          'classPrivateProperties',
          'classPrivateMethods',
          // proposals shipped in major browsers
          'classStaticBlock',
          'privateIn',
          // these ES proposals are provided for backward compatibility
          // they are enabled by default by babel-eslint@10, consider remove them in futural versions:
          'decorators-legacy',
          'doExpressions',
          'exportDefaultFrom',
          'functionBind',
          'throwExpressions',
          ['pipelineOperator', { proposal: 'minimal' }],
        ],
      },
    },
  },

  settings: {
    react: {
      version: 'detect',
    },
  },

  rules: {
    'react/jsx-uses-vars': 'warn',
    'react/jsx-uses-react': 'warn',
  },
};
