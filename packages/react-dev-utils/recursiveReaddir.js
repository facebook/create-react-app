/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Roughly based on recursive-readdir which is not maintained
// See: https://github.com/jergason/recursive-readdir/blob/master/index.js

var fs = require('fs');
var p = require('path');

function readdir(path, callback) {
  if (!callback) {
    return new Promise(function (resolve, reject) {
      readdir(path, function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  var list = [];

  fs.readdir(path, function (err, files) {
    if (err) {
      return callback(err);
    }

    var pending = files.length;
    if (!pending) {
      // we are done, woop woop
      return callback(null, list);
    }

    files.forEach(function (file) {
      var filePath = p.join(path, file);
      fs.stat(filePath, function (_err, stats) {
        if (_err) {
          return callback(_err);
        }

        if (stats.isDirectory()) {
          readdir(filePath, function (__err, res) {
            if (__err) {
              return callback(__err);
            }

            list = list.concat(res);
            pending -= 1;
            if (!pending) {
              return callback(null, list);
            }
          });
        } else {
          list.push(filePath);
          pending -= 1;
          if (!pending) {
            return callback(null, list);
          }
        }
      });
    });
  });
}

module.exports = readdir;
