const setProxies = require('exo/proxy')
const snow = require('snow')
const setWebpackManifest = require('snow/lib/utils/webpackManifest.js')
const hf = require('hf')
const snowConfig = require('./snow.config.js')

/**
 * Expose the app
 */
const app = (module.exports = snow(__dirname, hf, snowConfig))

setWebpackManifest(app, 'build')

if (app.get('env') === 'development') {
  app.stack.front(() => {
    setProxies(app)
  })
}

app.stack.postRoute(() => {
  app.get('*', (req, res) => {
    res.render('index', {
      indexPath: '../build/_index.html',
      // _layoutFile: './async_layout'
    })
  })
})
