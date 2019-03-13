const setProxies = require('exo/proxy')
const snow = require('snow')
const setWebpackManifest = require('snow/lib/utils/webpackManifest.js')
const snowConfig = require('./snow.config.js')
const hf = require('hf')

/**
 * Expose the app
 */
const app = (module.exports = snow(__dirname, hf, snowConfig))

setWebpackManifest(app, 'build')

if (app.get('env') === 'development') {
  app.stack.front(function() {
    setProxies(app)
  })
}

app.stack.postRoute(function() {
  app.get('/', (req, res) => {
    res.render('index', {
      indexPath: '../build/_index.html',
      // _layoutFile: './async_layout'
    })
  })
})
