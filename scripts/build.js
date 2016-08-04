/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

process.env.NODE_ENV = 'production';

var chalk = require('chalk');
var fs = require('fs');
var path = require('path');
var filesize = require('filesize');
var gzipSize = require('gzip-size').sync;
var rimrafSync = require('rimraf').sync;
var webpack = require('webpack');
var config = require('../config/webpack.config.prod');
var paths = require('../config/paths');
var recursive = require('recursive-readdir');
var stripAnsi = require('strip-ansi');

function removeFileNameHash(fileName) {
  return fileName.replace(paths.appBuild, '')
    .replace(/\/?(.*)(\.\w+)(\.js|\.css)/, function(match, p1, p2, p3) {
      return p1 + p3;
    });
}

function sizeDifference(currentSize, previousSize) {
  var FIFTY_KILOBYTES = 1024 * 50;
  var difference = currentSize - previousSize;
  var fileSize = !Number.isNaN(difference) ? filesize(difference) : 0;
  if (difference >= FIFTY_KILOBYTES) {
    return chalk.red('+' + fileSize);
  } else if (difference < FIFTY_KILOBYTES && difference > 0) {
    return chalk.yellow('+' + fileSize);
  } else if (difference < 0) {
    return chalk.green(fileSize);
  } else {
    return '';
  }
}

recursive(paths.appBuild, function (err, fileNames) {
  fileNames = fileNames || [];
  var previousSizeMap = fileNames.filter(fileName => /\.(js|css)$/.test(fileName))
    .reduce((memo, fileName) => {
      var contents = fs.readFileSync(fileName);
      var key = removeFileNameHash(fileName);
      memo[key] = gzipSize(contents);
      return memo;
    }, {} );

  // Remove all content but keep the directory so that
  // if you're in it, you don't end up in Trash
  rimrafSync(paths.appBuild + '/*');

  build(previousSizeMap);
});

function build(previousSizeMap) {
  console.log('Creating an optimized production build...');
  webpack(config).run(function(err, stats) {
    if (err) {
      console.error('Failed to create a production build. Reason:');
      console.error(err.message || err);
      process.exit(1);
    }

    console.log(chalk.green('Compiled successfully.'));
    console.log();

    console.log('File sizes after gzip:');
    console.log();
    var assets = stats.toJson().assets
      .filter(asset => /\.(js|css)$/.test(asset.name))
      .map(asset => {
        var fileContents = fs.readFileSync(paths.appBuild + '/' + asset.name);
        var size = gzipSize(fileContents);
        var previousSize = previousSizeMap[removeFileNameHash(asset.name)];
        var difference = sizeDifference(size, previousSize);
        return {
          folder: path.join('build', path.dirname(asset.name)),
          name: path.basename(asset.name),
          size: size,
          sizeLabel: filesize(size) + (difference ? ' (' + difference + ')' : '')
        };
      });
    assets.sort((a, b) => b.size - a.size);

    var longestSizeLabelLength = Math.max.apply(null,
      assets.map(a => stripAnsi(a.sizeLabel).length)
    );
    assets.forEach(asset => {
      var sizeLabel = asset.sizeLabel;
	  var sizeLength = stripAnsi(sizeLabel).length;
      if (sizeLength < longestSizeLabelLength) {
        var rightPadding = ' '.repeat(longestSizeLabelLength - sizeLength);
        sizeLabel += rightPadding;
      }
      console.log(
        '  ' + sizeLabel +
        '  ' + chalk.dim(asset.folder + path.sep) + chalk.cyan(asset.name)
      );
    });
    console.log();

    var openCommand = process.platform === 'win32' ? 'start' : 'open';
    var homepagePath = require(paths.appPackageJson).homepage;
    if (homepagePath) {
      console.log('You can now publish them at ' + homepagePath + '.');
      console.log('For example, if you use GitHub Pages:');
      console.log();
      console.log('  git commit -am "Save local changes"');
      console.log('  git checkout -B gh-pages');
      console.log('  git add -f build');
      console.log('  git commit -am "Rebuild website"');
      console.log('  git filter-branch -f --prune-empty --subdirectory-filter build');
      console.log('  git push -f origin gh-pages');
      console.log('  git checkout -');
      console.log();
    } else {
      console.log('You can now serve them with any static server.');
      console.log('For example:');
      console.log();
      console.log('  npm install -g pushstate-server');
      console.log('  pushstate-server build');
      console.log('  ' + openCommand + ' http://localhost:9000');
      console.log();
      console.log(chalk.dim('The project was built assuming it is hosted at the root.'));
      console.log(chalk.dim('Set the "homepage" field in package.json to override this.'));
      console.log(chalk.dim('For example, "homepage": "http://user.github.io/project".'));
    }
    console.log();
  });
}
