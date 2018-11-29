/* eslint-disable */
const fork = require('child_process').fork;
const path = require('path');
const paths = require('../paths');
const fs = require('fs');

module.exports = class SSRDevRebuilder {
  apply(compiler) {
    compiler.plugin('emit', (compilation, callback) => {
      // var changedFiles = Object.keys(
      //   compilation.fileTimestamps
      // ).filter(watchfile => {
      //   return (
      //     (this.prevTimestamps[watchfile] || this.startTime) <
      //     (compilation.fileTimestamps[watchfile] || Infinity)
      //   );
      // });

      let ssrDefer = { resolve: null, reject: null, promise: null };
      ssrDefer.promise = new Promise((r, j) => {
        ssrDefer.resolve = r;
        ssrDefer.reject = j;
      });

      if (fs.existsSync(paths.appIndexJsSSR)) {
        console.log('Creating ssr bundle...');
        const ssrCP = fork(
          path.resolve(__dirname, '../webpack.config.ssr'),
          [],
          {
            stdio: 'inherit',
            env: process.env
          }
        );

        ssrCP.once('error', err => {
          console.log(err);
          ssrDefer.resolve();
          ssrCP.removeAllListeners('exit');
        });
        ssrCP.once('exit', () => {
          ssrDefer.resolve();
        });
      } else {
        ssrDefer.resolve();
      }

      this.prevTimestamps = compilation.fileTimestamps;
      ssrDefer.promise.then(callback);
    });
  }
};
