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
    'import/resolver': {
      node: {
        extensions: ['.js', '.json']
      }
    },
    'import/extensions': ['.js'],
    'import/ignore': [
      'node_modules',
      '\\.(json|css|jpg|png|gif|svg|eot|svg|ttf|woff|woff2|mp4|webm)$',
    ]
  },

  rules: {

    // http://eslint.org/docs/rules/

    'array-callback-return': ERROR,
    'block-scoped-var': WARNING,
    curly: [WARNING, 'multi-line'],
    'default-case': [ERROR, { commentPattern: '^no default$' }],
    'dot-notation': [WARNING, { allowKeywords: true }],
    'dot-location': [ERROR, 'property'],
    eqeqeq: [ERROR, 'allow-null'],
    'guard-for-in': ERROR,
    'no-caller': ERROR,
    'no-case-declarations': WARNING,
    'no-empty-pattern': ERROR,
    'no-eval': ERROR,
    'no-extend-native': ERROR,
    'no-extra-bind': ERROR,
    'no-extra-label': ERROR,
    'no-fallthrough': ERROR,
    'no-implied-eval': ERROR,
    'no-invalid-this': WARNING,
    'no-iterator': ERROR,
    'no-labels': [ERROR, { allowLoop: false, allowSwitch: false }],
    'no-lone-blocks': ERROR,
    'no-loop-func': ERROR,
    'no-multi-spaces': WARNING,
    'no-multi-str': ERROR,
    'no-native-reassign': ERROR,
    'no-new': ERROR,
    'no-new-func': ERROR,
    'no-new-wrappers': ERROR,
    'no-octal': ERROR,
    'no-octal-escape': ERROR,
    'no-redeclare': ERROR,
    'no-return-assign': ERROR,
    'no-script-url': ERROR,
    'no-self-assign': ERROR,
    'no-self-compare': ERROR,
    'no-sequences': ERROR,
    'no-throw-literal': ERROR,
    'no-unused-expressions': ERROR,
    'no-unused-labels': ERROR,
    'no-useless-concat': ERROR,
    'no-useless-escape': ERROR,
    'no-with': ERROR,
    radix: ERROR,
    yoda: WARNING,
    'no-cond-assign': [ERROR, 'always'],
    'no-console': OFF, // TODO: enable for production?
    'no-constant-condition': WARNING,
    'no-control-regex': ERROR,
    'no-debugger': WARNING, // TODO: enable for production?
    'no-dupe-args': ERROR,
    'no-dupe-keys': ERROR,
    'no-duplicate-case': ERROR,
    'no-empty': [WARNING, {
      allowEmptyCatch: true
    }],
    'no-empty-character-class': ERROR,
    'no-ex-assign': ERROR,
    'no-extra-boolean-cast': WARNING,
    'no-extra-semi': WARNING,
    'no-func-assign': ERROR,
    'no-invalid-regexp': ERROR,
    'no-irregular-whitespace': WARNING,
    'no-negated-in-lhs': ERROR,
    'no-obj-calls': ERROR,
    'no-prototype-builtins': WARNING,
    'no-regex-spaces': ERROR,
    'no-sparse-arrays': ERROR,
    'no-unexpected-multiline': ERROR,
    'no-unreachable': ERROR,
    'no-unsafe-finally': WARNING,
    'use-isnan': ERROR,
    'valid-typeof': ERROR,
    'block-spacing': [WARNING, 'always'],
    'brace-style': [WARNING, '1tbs', { allowSingleLine: true }],
    camelcase: [WARNING, { properties: 'never' }],
    'comma-spacing': [WARNING, { before: false, after: true }],
    'comma-style': [WARNING, 'last'],
    'computed-property-spacing': [WARNING, 'never'],
    'eol-last': WARNING,
    indent: [WARNING, 2],
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
    'no-mixed-spaces-and-tabs': WARNING,
    'no-multiple-empty-lines': [WARNING, { max: 2, maxEOF: 1 }],
    'no-nested-ternary': WARNING,
    'no-new-object': ERROR,
    'no-restricted-syntax': [
      ERROR,
      'LabeledStatement',
      'WithStatement',
    ],
    'no-spaced-func': WARNING,
    'no-trailing-spaces': WARNING,
    'no-unneeded-ternary': [WARNING, { defaultAssignment: false }],
    'no-whitespace-before-property': ERROR,
    'object-property-newline': [WARNING, {
      allowMultiplePropertiesPerLine: true,
    }],
    'one-var': [WARNING, 'never'],
    'one-var-declaration-per-line': [WARNING, 'always'],
    'operator-assignment': [ERROR, 'always'],
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
    'unicode-bom': [ERROR, 'never'],
    'no-delete-var': ERROR,
    'no-label-var': ERROR,
    'no-shadow': WARNING,
    'no-shadow-restricted-names': ERROR,
    'no-undef': ERROR,
    'no-unused-vars': [ERROR, { vars: 'local', args: 'after-used' }],
    'no-use-before-define': [ERROR, 'nofunc'],
    'arrow-spacing': [WARNING, { before: true, after: true }],
    'generator-star-spacing': [WARNING, { before: false, after: true }],
    'no-confusing-arrow': [WARNING, {
      allowParens: true,
    }],
    'no-const-assign': ERROR,
    'no-dupe-class-members': ERROR,
    'no-duplicate-imports': WARNING,
    'no-new-symbol': ERROR,
    'no-this-before-super': ERROR,
    'no-useless-computed-key': ERROR,
    'no-useless-constructor': ERROR,
    'no-useless-rename': [ERROR, {
      ignoreDestructuring: false,
      ignoreImport: false,
      ignoreExport: false,
    }],
    'no-var': WARNING,
    'prefer-arrow-callback': [WARNING, {
      allowNamedFunctions: false,
      allowUnboundThis: true,
    }],
    'prefer-rest-params': ERROR,
    'require-yield': ERROR,
    'rest-spread-spacing': [ERROR, 'never'],
    'template-curly-spacing': WARNING,
    'yield-star-spacing': [WARNING, 'after'],
    strict: [ERROR, 'never'],

    // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/

    'import/no-unresolved': [ERROR, { commonjs: true }],
    'import/named': ERROR,
    'import/default': ERROR,
    'import/namespace': ERROR,
    'import/export': ERROR,
    'import/no-named-as-default': ERROR,
    'import/no-named-as-default-member': ERROR,
    'import/no-extraneous-dependencies': ERROR,
    'import/no-mutable-exports': WARNING,
    'import/no-commonjs': WARNING,
    'import/no-amd': ERROR,
    'import/imports-first': WARNING,
    'import/no-duplicates': ERROR,
    'import/prefer-default-export': WARNING,

    // https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules
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
    'react/jsx-space-before-closing': WARNING,
    'react/wrap-multilines': [WARNING, {
      declaration: true,
      assignment: true,
      return: true
    }],
    'react/jsx-equals-spacing': [ERROR, 'never'],
    'react/jsx-indent': [WARNING, 2]
  }
};
