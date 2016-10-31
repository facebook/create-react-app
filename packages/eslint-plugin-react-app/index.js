'use strict';
const config = require('./config');

const plugins = [
  'import',
  'flowtype',
  'jsx-a11y',
  'react'
];

const rules = {};

plugins.forEach((pluginName) => {
  const plugin = require(`eslint-plugin-${pluginName}`);
  Object.keys(plugin.rules).forEach((ruleName) => {
    rules[`${pluginName}/${ruleName}`] = plugin.rules[ruleName];
  });
});

module.exports = {
  configs: {
    recommended: config,
  },
  rules,
};
