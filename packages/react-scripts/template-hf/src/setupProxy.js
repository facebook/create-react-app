const setProxies = require('exo/proxy')
const hf = require('hf')
const snow = require('snow')
const waitForWebpack = require('snow/lib/utils/waitForWebpack.js')
const snowConfig = require('../snow.config.js')

const initiatedDirectory = process.env.INIT_CWD

module.exports = app => {
  setProxies(app)
  waitForWebpack(app)

  snowConfig.app = app
  snow(initiatedDirectory, hf, snowConfig)

  app.get('*', (req, res) => {
    res.render('index', {
      indexPath: '../dist/_index.html',
      // _layoutFile: './async_layout'
    })
  })
}
