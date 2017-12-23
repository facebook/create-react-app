/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

// Inspired by https://github.com/airbnb/javascript but less opinionated.

// We use eslint-loader so even warnings are very visible.
// This is why we only use "WARNING" level for potential errors,
// and we don't use "ERROR" level at all.

// In the future, we might create a separate list of rules for production.
// It would probably be more strict.

// The ESLint browser environment defines all browser globals as valid,
// even though most people don't know some of them exist (e.g. `name` or `status`).
// This is dangerous as it hides accidentally undefined variables.
// We blacklist the globals that we deem potentially confusing.
// To use them, explicitly reference them, e.g. `window.name` or `window.status`.
var restrictedGlobals = [
  'addEventListener',
  'blur',
  'close',
  'closed',
  'confirm',
  'defaultStatus',
  'defaultstatus',
  'event',
  'external',
  'find',
  'focus',
  'frameElement',
  'frames',
  'history',
  'innerHeight',
  'innerWidth',
  'length',
  'location',
  'locationbar',
  'menubar',
  'moveBy',
  'moveTo',
  'name',
  'onblur',
  'onerror',
  'onfocus',
  'onload',
  'onresize',
  'onunload',
  'open',
  'opener',
  'opera',
  'outerHeight',
  'outerWidth',
  'pageXOffset',
  'pageYOffset',
  'parent',
  'print',
  'removeEventListener',
  'resizeBy',
  'resizeTo',
  'screen',
  'screenLeft',
  'screenTop',
  'screenX',
  'screenY',
  'scroll',
  'scrollbars',
  'scrollBy',
  'scrollTo',
  'scrollX',
  'scrollY',
  'self',
  'status',
  'statusbar',
  'stop',
  'toolbar',
  'top',
];

module.exports = {
  root: true,

  parser: 'babel-eslint',

  extends: [
    'airbnb',
    'plugin:jsx-a11y/recommended',
    'prettier',
    'prettier/flowtype',
    'prettier/react',
  ],

  plugins: ['import', 'flowtype', 'jsx-a11y', 'react', 'compat'],

  env: {
    browser: true,
    commonjs: true,
    es6: true,
    jest: true,
    node: true,
  },

  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      generators: true,
      experimentalObjectRestSpread: true,
    },
  },

  rules: {
    // https://github.com/benmosher/eslint-plugin-import/tree/master/docs/rules
    'class-methods-use-this': 0,
    'global-require': 0,
    'no-console': 0,
    'no-restricted-globals': ['error'].concat(restrictedGlobals),
    'no-use-before-define': [
      'warn',
      {
        functions: false,
        classes: false,
        variables: false,
      },
    ],

    // https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules
    'react/jsx-filename-extension': 0,
    'react/prefer-stateless-function': 0,

    // https://github.com/evcohen/eslint-plugin-jsx-a11y/tree/master/docs/rules

    // https://github.com/gajus/eslint-plugin-flowtype
    'flowtype/define-flow-type': 'warn',
    'flowtype/require-valid-file-annotation': 'warn',
    'flowtype/use-flow-type': 'warn',

    // https://github.com/amilajack/eslint-plugin-compat
    'compat/compat': 'warn',

    // https://github.com/benmosher/eslint-plugin-import/tree/master/docs/rules
    'import/prefer-default-export': 0,
  },
};
