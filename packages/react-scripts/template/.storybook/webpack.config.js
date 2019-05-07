const custom = require('@fs/react-scripts/config/zion-webpack.config.js')

module.exports = async ({ config, mode }) => {
  // There are issues with storybook and lerna monorepos. Following the issue here,
  // there was a suggestion to remove the default babel-loader from the default storybook config.
  // This seemed to fix my issues.
  // https://github.com/storybooks/storybook/issues/3346#issuecomment-425516669
  config.module.rules = config.module.rules.filter(
    rule =>
      !(rule.use && rule.use.length && rule.use.find(({ loader }) => loader === 'babel-loader'))
  )

  // https://storybook.js.org/docs/configurations/custom-webpack-config/
  // So the react-scripts webpack has a "fallback" loader that catches almost
  // everything. We don't want to use that, cause it interferes with the storybook loaders 
  // that we actually want to be using
  custom.module.rules.forEach(rule => {
    if (rule.oneOf && !rule.oneOf[rule.oneOf.length - 1].test) {
      rule.oneOf.pop()
    }
  })

  // use storybook's default rules, and then add OUR rules afterwards
  config.module.rules = [...config.module.rules, ...custom.module.rules]

  return config
}
