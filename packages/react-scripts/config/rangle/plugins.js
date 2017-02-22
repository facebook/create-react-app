const StyleLintPlugin = require('stylelint-webpack-plugin');

module.exports = [
  new StyleLintPlugin({
    configFile: './.stylelintrc',
    files: ['src/**/*.css'],
    failOnError: false,
  }),
];
