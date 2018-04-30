/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

var fs = require('fs');

function setThemeColor(publicPath) {
  const manifest = require(publicPath + '/manifest.json');
  const themeColor = manifest.theme_color || '#000000';
  const publicHtmlFile = publicPath + '/index.html';
  fs.readFile(publicHtmlFile, 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    }
    var result = data.replace('#000000', themeColor);

    fs.writeFile(publicHtmlFile, result, 'utf8', function(err) {
      if (err) {
        return console.log(err);
      }
    });
  });
}

module.exports = setThemeColor;
