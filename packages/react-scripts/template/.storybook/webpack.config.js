module.exports = async ({ config, mode }) => {
  // There are issues with storybook and lerna monorepos. Following the issue here,
  // there was a suggestion to remove the default babel-loader from the default storybook config.
  // This seemed to fix my issues.
  // https://github.com/storybooks/storybook/issues/3346#issuecomment-425516669
  config.module.rules = config.module.rules.filter(
    rule =>
      !(rule.use && rule.use.length && rule.use.find(({ loader }) => loader === 'babel-loader'))
  )

  const customBabelLoader = {
    test: /\.(js|jsx)$/,
    exclude: /node_modules\/(?!@fs)/,
    use: {
      loader: 'babel-loader',
      options: {
        customize: require.resolve('@fs/babel-preset-frontier/webpack-overrides'),
        presets: [require.resolve('@fs/babel-preset-frontier')],
        plugins: [['react-docgen', { DOC_GEN_COLLECTION_NAME: 'STORYBOOK_REACT_CLASSES' }]],
      },
    },
  }

  config.module.rules.push(customBabelLoader, {
    test: /locales/,
    loader: '@alienfast/i18next-loader',
    options: {
      debug: false,
      basenameAsNamespace: true,
    },
  })

  config.module.rules.push({
    test: /\.stories\.jsx?$/,
    loaders: [require.resolve('@storybook/addon-storysource/loader')],
    enforce: 'pre',
  })

  // https://github.com/storybooks/storybook/issues/457#issuecomment-459772340
  config.devtool = 'inline-source-map'

  return config
}
