'use strict';

const order = require('./order');
const propertiesOrder = require('./properties-order');
const noUnsupportedBrowserFeatures = require('./no-unsupported-browser-features');

module.exports = {
  plugins: [
    'stylelint-order',
    'stylelint-scss',
    'stylelint-no-unsupported-browser-features',
    'stylelint-declaration-block-no-ignored-properties',
  ],
  rules: {
    'plugin/declaration-block-no-ignored-properties': true,
    'plugin/no-unsupported-browser-features': noUnsupportedBrowserFeatures,
    'at-rule-no-unknown': true,
    'at-rule-no-vendor-prefix': true,

    'block-no-empty': true,

    'color-hex-case': 'lower',
    'color-hex-length': null,
    'color-no-invalid-hex': true,

    'comment-no-empty': true,

    'declaration-block-no-duplicate-properties': [
      true,
      {
        ignore: ['consecutive-duplicates-with-different-values'],
      },
    ],
    'declaration-block-no-redundant-longhand-properties': true,
    'declaration-block-no-shorthand-property-overrides': true,
    'declaration-block-semicolon-newline-after': 'always',
    'declaration-block-trailing-semicolon': 'always',
    'declaration-colon-space-after': 'always',
    'declaration-colon-space-before': 'never',

    'font-family-no-duplicate-names': true,

    'function-calc-no-unspaced-operator': true,
    'function-linear-gradient-no-nonstandard-direction': true,
    'function-parentheses-space-inside': 'never',
    'function-url-quotes': 'always',

    'keyframe-declaration-no-important': true,

    'length-zero-no-unit': true,

    'max-nesting-depth': 3,

    'media-feature-name-no-vendor-prefix': true,
    'media-feature-name-no-unknown': true,

    'no-empty-source': true,
    'no-extra-semicolons': true,
    'no-invalid-double-slash-comments': true,
    'no-duplicate-selectors': true,
    'no-eol-whitespace': true,

    'number-leading-zero': 'always',
    'number-no-trailing-zeros': true,

    'property-no-unknown': true,
    'property-no-vendor-prefix': true,

    /* stylelint-scss */
    'scss/at-if-closing-brace-newline-after': 'always-last-in-chain',
    'scss/at-if-closing-brace-space-after': 'always-intermediate',
    'scss/at-import-no-partial-leading-underscore': true,
    'scss/at-import-partial-extension-whitelist': [''],
    'scss/selector-no-redundant-nesting-selector': true,

    'selector-pseudo-class-no-unknown': true,
    'selector-pseudo-element-no-unknown': true,
    'selector-type-no-unknown': true,
    'selector-class-pattern':
      '^((?:-{1,2}|_{2})?[a-z0-9]+(?:(?:-{1,2}|_{2})[a-z0-9]+)*)(?:-{1,2}|_{2})?$',
    'selector-list-comma-newline-after': 'always',
    'selector-max-id': 0,
    'selector-no-vendor-prefix': true,
    'selector-pseudo-element-colon-notation': 'double',

    'shorthand-property-no-redundant-values': true,

    'string-no-newline': true,
    'string-quotes': 'single',
    'unit-no-unknown': true,

    'value-list-comma-space-after': 'always-single-line',
    'value-no-vendor-prefix': true,

    /* stylelint-order */
    'order/order': order,
    'order/properties-order': propertiesOrder,
  },
};
