/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

// Inspired by https://github.com/airbnb/javascript but less opinionated.

var OFF = 0; // rules that split the community (e.g. semicolons)
var WARNING = 1; // style rules accepted by the majority of popular styleguides
var ERROR = 2; // rules that prevent common mistakes

module.exports = {
  root: true,

  plugins: ['react', 'import'],

  env: {
    es6: true,
    commonjs: true,
    browser: true
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

  settings: {
    'import/ignore': [
      'node_modules',
      '\\.(json|css|jpg|png|gif|eot|svg|ttf|woff|woff2|mp4|webm)$',
    ],
    'import/extensions': ['.js'],
    'import/resolver': {
      node: {
        extensions: ['.js', '.json']
      }
    }
  },

  rules: {
    // http://eslint.org/docs/rules/
    'array-callback-return': ERROR,
    'arrow-spacing': [WARNING, { before: true, after: true }],
    'block-scoped-var': WARNING,
    'block-spacing': [WARNING, 'always'],
    'brace-style': [WARNING, '1tbs', { allowSingleLine: true }],
    'comma-spacing': [WARNING, { before: false, after: true }],
    'comma-style': [WARNING, 'last'],
    'computed-property-spacing': [WARNING, 'never'],
    curly: [WARNING, 'multi-line'],
    'default-case': [ERROR, { commentPattern: '^no default$' }],
    'dot-notation': [WARNING, { allowKeywords: true }],
    'dot-location': [ERROR, 'property'],
    'eol-last': WARNING,
    eqeqeq: [ERROR, 'allow-null'],
    'generator-star-spacing': [WARNING, { before: false, after: true }],
    'guard-for-in': ERROR,
    'key-spacing': [WARNING, { beforeColon: false, afterColon: true }],
    'keyword-spacing': [WARNING, {
      before: true,
      after: true,
      overrides: {
        return: { after: true },
        throw: { after: true },
        case: { after: true }
      }
    }],
    'linebreak-style': [WARNING, 'unix'],
    'new-cap': [ERROR, { newIsCap: true }],
    'new-parens': ERROR,
    'newline-per-chained-call': [WARNING, { ignoreChainWithDepth: 4 }],
    'no-array-constructor': ERROR,
    'no-caller': ERROR,
    'no-case-declarations': WARNING,
    'no-cond-assign': [ERROR, 'always'],
    'no-confusing-arrow': [WARNING, {
      allowParens: true,
    }],
    'no-console': OFF, // TODO: enable for production?
    'no-constant-condition': WARNING,
    'no-const-assign': ERROR,
    'no-control-regex': ERROR,
    'no-debugger': WARNING, // TODO: enable for production?
    'no-delete-var': ERROR,
    'no-dupe-args': ERROR,
    'no-dupe-class-members': ERROR,
    'no-dupe-keys': ERROR,
    'no-duplicate-case': ERROR,
    'no-duplicate-imports': WARNING,
    'no-empty': [WARNING, {
      allowEmptyCatch: true
    }],
    'no-empty-character-class': ERROR,
    'no-empty-pattern': ERROR,
    'no-eval': ERROR,
    'no-ex-assign': ERROR,
    'no-extend-native': ERROR,
    'no-extra-bind': ERROR,
    'no-extra-boolean-cast': WARNING,
    'no-extra-label': ERROR,
    'no-extra-semi': WARNING,
    'no-fallthrough': ERROR,
    'no-func-assign': ERROR,
    'no-implied-eval': ERROR,
    'no-invalid-this': WARNING,
    'no-invalid-regexp': ERROR,
    'no-irregular-whitespace': WARNING,
    'no-iterator': ERROR,
    'no-label-var': ERROR,
    'no-labels': [ERROR, { allowLoop: false, allowSwitch: false }],
    'no-lone-blocks': ERROR,
    'no-loop-func': ERROR,
    'no-mixed-operators': [ERROR, {
      groups: [
        ['+', '-', '*', '/', '%', '**'],
        ['&', '|', '^', '~', '<<', '>>', '>>>'],
        ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
        ['&&', '||'],
        ['in', 'instanceof']
      ],
      allowSamePrecedence: false
    }],
    'no-multi-spaces': WARNING,
    'no-multi-str': ERROR,
    'no-multiple-empty-lines': [WARNING, { max: 2, maxEOF: 1 }],
    'no-native-reassign': ERROR,
    'no-negated-in-lhs': ERROR,
    'no-nested-ternary': WARNING,
    'no-new': ERROR,
    'no-new-func': ERROR,
    'no-new-object': ERROR,
    'no-new-symbol': ERROR,
    'no-new-wrappers': ERROR,
    'no-obj-calls': ERROR,
    'no-octal': ERROR,
    'no-octal-escape': ERROR,
    'no-prototype-builtins': WARNING,
    'no-redeclare': ERROR,
    'no-regex-spaces': ERROR,
    'no-restricted-syntax': [
      ERROR,
      'LabeledStatement',
      'WithStatement',
    ],
    'no-return-assign': ERROR,
    'no-script-url': ERROR,
    'no-self-assign': ERROR,
    'no-self-compare': ERROR,
    'no-sequences': ERROR,
    'no-shadow': WARNING,
    'no-shadow-restricted-names': ERROR,
    'no-spaced-func': WARNING,
    'no-sparse-arrays': ERROR,
    'no-this-before-super': ERROR,
    'no-throw-literal': ERROR,
    'no-trailing-spaces': WARNING,
    'no-undef': ERROR,
    'no-unexpected-multiline': ERROR,
    'no-unneeded-ternary': [WARNING, { defaultAssignment: false }],
    'no-unreachable': ERROR,
    'no-unsafe-finally': WARNING,
    'no-unused-expressions': ERROR,
    'no-unused-labels': ERROR,
    'no-unused-vars': [ERROR, { vars: 'local', args: 'after-used' }],
    'no-use-before-define': [ERROR, 'nofunc'],
    'no-useless-computed-key': ERROR,
    'no-useless-concat': ERROR,
    'no-useless-constructor': ERROR,
    'no-useless-escape': ERROR,
    'no-useless-rename': [ERROR, {
      ignoreDestructuring: false,
      ignoreImport: false,
      ignoreExport: false,
    }],
    'no-var': WARNING,
    'no-with': ERROR,
    'no-whitespace-before-property': ERROR,
    'object-property-newline': [WARNING, {
      allowMultiplePropertiesPerLine: true,
    }],
    'operator-assignment': [ERROR, 'always'],
    radix: ERROR,
    'require-yield': ERROR,
    'rest-spread-spacing': [ERROR, 'never'],
    'semi-spacing': [WARNING, { before: false, after: true }],
    'space-before-blocks': WARNING,
    'space-before-function-paren': [WARNING, { anonymous: 'always', named: 'never' }],
    'space-in-parens': [WARNING, 'never'],
    'space-infix-ops': WARNING,
    'space-unary-ops': [WARNING, {
      words: true,
      nonwords: false,
      overrides: {},
    }],
    'spaced-comment': [WARNING, 'always', {
      exceptions: ['-', '+'],
      markers: ['=', '!']
    }],
    strict: [ERROR, 'never'],
    'template-curly-spacing': WARNING,
    'unicode-bom': [ERROR, 'never'],
    'use-isnan': ERROR,
    'valid-typeof': ERROR,
    'yield-star-spacing': [WARNING, 'after'],
    yoda: WARNING,

    // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/

    'import/default': ERROR,
    'import/export': ERROR,
    'import/imports-first': WARNING,
    'import/named': ERROR,
    'import/namespace': ERROR,
    'import/no-amd': ERROR,
    'import/no-commonjs': WARNING,
    'import/no-duplicates': ERROR,
    'import/no-extraneous-dependencies': ERROR,
    'import/no-named-as-default': ERROR,
    'import/no-named-as-default-member': ERROR,
    'import/no-unresolved': [ERROR, { commonjs: true }],

    // https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules
    'react/jsx-equals-spacing': [ERROR, 'never'],
    'react/jsx-handler-names': [WARNING, {
      eventHandlerPrefix: 'handle',
      eventHandlerPropPrefix: 'on',
    }],
    'react/jsx-key': WARNING,
    'react/jsx-no-duplicate-props': [ERROR, { ignoreCase: true }],
    'react/jsx-no-undef': ERROR,
    'react/jsx-pascal-case': [ERROR, {
      allowAllCaps: true,
      ignore: [],
    }],
    'react/jsx-space-before-closing': WARNING,
    'react/jsx-uses-react': [ERROR, { pragma: 'React' }],
    'react/jsx-uses-vars': ERROR,
    'react/no-deprecated': ERROR,
    'react/no-did-mount-set-state': [WARNING, 'allow-in-func'],
    'react/no-did-update-set-state': [WARNING, 'allow-in-func'],
    'react/no-direct-mutation-state': ERROR,
    'react/no-is-mounted': ERROR,
    'react/no-multi-comp': [WARNING, { ignoreStateless: true }],
    'react/no-string-refs': WARNING,
    'react/prefer-es6-class': OFF, // TODO: revisit after updating docs
    'react/prefer-stateless-function': OFF, // TODO: revisit after updating docs
    'react/react-in-jsx-scope': ERROR,
    'react/require-render-return': ERROR,
    'react/wrap-multilines': [WARNING, {
      declaration: true,
      assignment: true,
      return: true
    }]
  }
};
