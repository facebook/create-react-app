'use strict';

module.exports = {
  extends: [
    require.resolve('eslint-config-vtex'),
    require.resolve('eslint-config-vtex-react'),
  ],
  rules: Object.assign(
    {},
    require('eslint-plugin-jsx-a11y').configs.recommended.rules
  ),
  plugins: ['jsx-a11y'],
};
