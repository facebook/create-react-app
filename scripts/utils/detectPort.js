/* ================================================================
 * detect-port by xdf(xudafeng[at]126.com)
 *
 * first created at : Tue Mar 17 2015 00:16:10 GMT+0800 (CST)
 *
 * ================================================================
 * Copyright xdf
 *
 * Licensed under the MIT License
 * You may not use this file except in compliance with the License.
 *
 * ================================================================ */

// We are forking this temporarily to resolve
// https://github.com/facebookincubator/create-react-app/issues/302.

// We can replace this fork with `detect-port` package when this is merged:
// https://github.com/xudafeng/detect-port/pull/4.

'use strict';

var net = require('net');

var inject = function(port) {
  var options = global.__detect ? global.__detect.options : {};

  if (options.verbose) {
    console.log('port %d was occupied', port);
  }
};

function detect(port, fn) {

  var _detect = function(port) {
    return new Promise(function(resolve, reject) {
      var socket = new net.Socket();
      socket.once('error', function() {
        socket.removeAllListeners('connect');
        socket.removeAllListeners('error');
        socket.end();
        socket.destroy();
        socket.unref();
        var server = new net.Server();
        server.on('error', function() {
          inject(port);
          port++;
          resolve(_detect(port));
        });

        server.listen(port, function() {
          server.once('close', function() {
            resolve(port);
          });
          server.close();
        });
      });
      socket.once('connect', function() {
        inject(port);
        port++;
        resolve(_detect(port));
        socket.removeAllListeners('connect');
        socket.removeAllListeners('error');
        socket.end();
        socket.destroy();
        socket.unref();
      });
      socket.connect({
        port: port
      });
    });
  }

  var _detect_with_cb = function(_fn) {
    _detect(port)
      .then(function(result) {
        _fn(null, result);
      })
      .catch(function(e) {
        _fn(e);
      });
  };

  return fn ? _detect_with_cb(fn) : _detect(port);
}

module.exports = detect;
