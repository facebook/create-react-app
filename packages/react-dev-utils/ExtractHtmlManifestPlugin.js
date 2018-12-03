/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// This Webpack plugin lets us interpolate custom variables into `index.html`.
// Usage: `new InterpolateHtmlPlugin(HtmlWebpackPlugin, { 'MY_VARIABLE': 42 })`
// Then, you can use %MY_VARIABLE% in your `index.html`.

// It works in tandem with HtmlWebpackPlugin.
// Learn more about creating plugins like this:
// https://github.com/ampedandwired/html-webpack-plugin#events

'use strict';
var fs = require('fs');
var path = require('path');

class ExtractHtmlManifestPlugin {
  constructor(htmlWebpackPlugin, opts) {
    this.htmlWebpackPlugin = htmlWebpackPlugin;
    this.opts = Object.assign(
      {
        fileName: 'html-manifest.json',
        serialize: function(manifest) {
          return JSON.stringify(manifest, null, 2);
        },
      },
      opts || {}
    );
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('ExtractHtmlManifestPlugin', compilation => {
      this.htmlWebpackPlugin
        .getHooks(compilation)
        .beforeAssetTagGeneration.tap('ExtractHtmlManifestPlugin', data => {
          var outputFolder = compiler.options.output.path;
          var outputFile = path.resolve(outputFolder, this.opts.fileName);
          var output = this.opts.serialize(data.assets);
          fs.writeFileSync(outputFile, output, 'utf8');
        });
    });
  }
}

module.exports = ExtractHtmlManifestPlugin;
