process.env.NODE_ENV = 'production';

var spawnSync = require('child_process').spawnSync;
var webpack = require('webpack');
var config = require('../webpack.config.prod');

spawnSync('rm', ['-rf', 'build']);
webpack(config).run(function(err, stats) {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log('Build successfully generated in the build/ folder');
});
