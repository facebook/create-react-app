const setProxies = require('exo/proxy');
const hf = require('hf');
const snow = require('snow');
const path = require('path');
const waitForWebpack = require('snow/lib/utils/waitForWebpack.js');

const initiatedDirectory = process.env.INIT_CWD;
const snowConfig = require(path.join(initiatedDirectory, 'snow.config.js'));

module.exports = app => {
  setProxies(app);
  waitForWebpack(app);

  snowConfig.app = app;
  snow(initiatedDirectory, hf, snowConfig);

  app.get('*', (req, res) => {
    res.render('index', {
      indexPath: '../dist/_index.html',
      // _layoutFile: './async_layout'
    });
  });
};
