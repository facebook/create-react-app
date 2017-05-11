'use strict';

module.exports = {
  plugins: ['stylelint-csstree-validator'],
  rules: {
    'at-rule-no-unknown': true,
    'color-no-invalid-hex': true,
    'declaration-block-no-duplicate-properties': true,
    'declaration-block-no-shorthand-property-overrides': true,
    'function-linear-gradient-no-nonstandard-direction': true,
    'media-feature-name-no-unknown': true,
    'no-invalid-double-slash-comments': true,
    'no-unknown-animations': true,
    'property-no-unknown': true,
    'selector-pseudo-class-no-unknown': true,
    'selector-pseudo-element-no-unknown': true,
    'selector-type-no-unknown': true,
    'string-no-newline': true,
    'unit-no-unknown': true,

    // csstree syntax validator https://github.com/csstree/stylelint-validator
    'csstree/validator': true,
  },
};
