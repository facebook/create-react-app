require('dotenv')
const styles = require('@fs/styleguidist-overrides/dist/styles.js')
const webpackConfig = require('@fs/configurations/webpack.dev.js')

module.exports = {
  webpackConfig,
  serverPort: 5009,
  pagePerSection: true,
  theme: {
    color: {
      sidebarBackground: '#333331',
    },
    sidebarWidth: 250,
    maxWidth: 1200,
  },
  styles,
  styleguideComponents: {
    Wrapper: require.resolve('@fs/styleguidist-overrides/dist/Wrapper.js'),
    StyleGuideRenderer: require.resolve('@fs/styleguidist-overrides/dist/StyleGuideRenderer.js'),
  },
  usageMode: 'expand',
  configureServer: app => {
    // This endpoint returns the current dev environment. Used by the client when in local development.
    app.get('/dev-env', (req, res) => {
      res.status(200).send({ environment: process.env.REMOTE_ENV || 'beta' })
    })
  },
}
