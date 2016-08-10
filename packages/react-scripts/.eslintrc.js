const clientESLintConfig = require('./config/eslint');

module.exports = Object.assign({}, clientESLintConfig, {
  env: Object.assign({}, clientESLintConfig.env, {
    node: true,
  })
});
