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
var restrictedGlobals = require('confusing-browser-globals');

/**
 * Function to generate eslint config rules
 *
 * @param {Object} options config options
 * @param {'warn' | 'error'} options.level default lint level
 */
module.exports = function makeConfig(options) {
  var level = options.level;
  if (level !== 'error' && level !== 'warn') {
    console.warn(
      'Invalid lint level specified. Expected "error" or "warn", got "' +
        level +
        '". Defaulting to "warn".'
    );
    level = 'warn';
  }

  return {
    root: true,

    parser: 'babel-eslint',

    plugins: ['import', 'flowtype', 'jsx-a11y', 'react'],

    env: {
      browser: true,
      commonjs: true,
      es6: true,
      jest: true,
      node: true
    },

    parserOptions: {
      ecmaVersion: 6,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
        generators: true,
        experimentalObjectRestSpread: true
      }
    },

    rules: {
      // http://eslint.org/docs/rules/
      'array-callback-return': level,
      'default-case': [level, { commentPattern: '^no default$' }],
      'dot-location': [level, 'property'],
      eqeqeq: [level, 'allow-null'],
      'new-parens': level,
      'no-array-constructor': level,
      'no-caller': level,
      'no-cond-assign': [level, 'except-parens'],
      'no-const-assign': level,
      'no-control-regex': level,
      'no-delete-var': level,
      'no-dupe-args': level,
      'no-dupe-class-members': level,
      'no-dupe-keys': level,
      'no-duplicate-case': level,
      'no-empty-character-class': level,
      'no-empty-pattern': level,
      'no-eval': level,
      'no-ex-assign': level,
      'no-extend-native': level,
      'no-extra-bind': level,
      'no-extra-label': level,
      'no-fallthrough': level,
      'no-func-assign': level,
      'no-implied-eval': level,
      'no-invalid-regexp': level,
      'no-iterator': level,
      'no-label-var': level,
      'no-labels': [level, { allowLoop: true, allowSwitch: false }],
      'no-lone-blocks': level,
      'no-loop-func': level,
      'no-mixed-operators': [
        level,
        {
          groups: [
            ['&', '|', '^', '~', '<<', '>>', '>>>'],
            ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
            ['&&', '||'],
            ['in', 'instanceof']
          ],
          allowSamePrecedence: false
        }
      ],
      'no-multi-str': level,
      'no-native-reassign': level,
      'no-negated-in-lhs': level,
      'no-new-func': level,
      'no-new-object': level,
      'no-new-symbol': level,
      'no-new-wrappers': level,
      'no-obj-calls': level,
      'no-octal': level,
      'no-octal-escape': level,
      'no-redeclare': level,
      'no-regex-spaces': level,
      'no-restricted-syntax': [level, 'WithStatement'],
      'no-script-url': level,
      'no-self-assign': level,
      'no-self-compare': level,
      'no-sequences': level,
      'no-shadow-restricted-names': level,
      'no-sparse-arrays': level,
      'no-template-curly-in-string': level,
      'no-this-before-super': level,
      'no-throw-literal': level,
      'no-undef': 'error',
      'no-restricted-globals': ['error'].concat(restrictedGlobals),
      'no-unexpected-multiline': level,
      'no-unreachable': level,
      'no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true
        }
      ],
      'no-unused-labels': level,
      'no-unused-vars': [
        level,
        {
          args: 'none',
          ignoreRestSiblings: true
        }
      ],
      'no-use-before-define': [
        level,
        {
          functions: false,
          classes: false,
          variables: false
        }
      ],
      'no-useless-computed-key': level,
      'no-useless-concat': level,
      'no-useless-constructor': level,
      'no-useless-escape': level,
      'no-useless-rename': [
        level,
        {
          ignoreDestructuring: false,
          ignoreImport: false,
          ignoreExport: false
        }
      ],
      'no-with': level,
      'no-whitespace-before-property': level,
      'require-yield': level,
      'rest-spread-spacing': [level, 'never'],
      strict: [level, 'never'],
      'unicode-bom': [level, 'never'],
      'use-isnan': level,
      'valid-typeof': level,
      'no-restricted-properties': [
        'error',
        {
          object: 'require',
          property: 'ensure',
          message:
            'Please use import() instead. More info: https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#code-splitting'
        },
        {
          object: 'System',
          property: 'import',
          message:
            'Please use import() instead. More info: https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#code-splitting'
        }
      ],
      'getter-return': level,

      // https://github.com/benmosher/eslint-plugin-import/tree/master/docs/rules
      'import/first': 'error',
      'import/no-amd': 'error',
      'import/no-webpack-loader-syntax': 'error',

      // https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules
      'react/forbid-foreign-prop-types': [level, { allowInPropTypes: true }],
      'react/jsx-no-comment-textnodes': level,
      'react/jsx-no-duplicate-props': [level, { ignoreCase: true }],
      'react/jsx-no-target-blank': level,
      'react/jsx-no-undef': 'error',
      'react/jsx-pascal-case': [
        level,
        {
          allowAllCaps: true,
          ignore: []
        }
      ],
      'react/jsx-uses-react': level,
      'react/jsx-uses-vars': level,
      'react/no-danger-with-children': level,
      'react/no-deprecated': level,
      'react/no-direct-mutation-state': level,
      'react/no-is-mounted': level,
      'react/react-in-jsx-scope': 'error',
      'react/require-render-return': 'error',
      'react/style-prop-object': level,

      // https://github.com/evcohen/eslint-plugin-jsx-a11y/tree/master/docs/rules
      'jsx-a11y/accessible-emoji': level,
      'jsx-a11y/alt-text': level,
      'jsx-a11y/anchor-has-content': level,
      'jsx-a11y/anchor-is-valid': [
        level,
        {
          aspects: ['noHref', 'invalidHref']
        }
      ],
      'jsx-a11y/aria-activedescendant-has-tabindex': level,
      'jsx-a11y/aria-props': level,
      'jsx-a11y/aria-proptypes': level,
      'jsx-a11y/aria-role': level,
      'jsx-a11y/aria-unsupported-elements': level,
      'jsx-a11y/heading-has-content': level,
      'jsx-a11y/iframe-has-title': level,
      'jsx-a11y/img-redundant-alt': level,
      'jsx-a11y/no-access-key': level,
      'jsx-a11y/no-distracting-elements': level,
      'jsx-a11y/no-redundant-roles': level,
      'jsx-a11y/role-has-required-aria-props': level,
      'jsx-a11y/role-supports-aria-props': level,
      'jsx-a11y/scope': level,

      // https://github.com/gajus/eslint-plugin-flowtype
      'flowtype/define-flow-type': level,
      'flowtype/require-valid-file-annotation': level,
      'flowtype/use-flow-type': level
    }
  };
};
