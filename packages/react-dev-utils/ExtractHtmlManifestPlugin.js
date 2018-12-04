/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// This Webpack plugin generates manifest of assets needed to reconstruct html page.
// Usage: `new ExtractHtmlManifestPlugin(HtmlWebpackPlugin, { fileName: 'html-manifest.json' })`

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
    this.output = '{}';
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('ExtractHtmlManifestPlugin', compilation => {
      this.htmlWebpackPlugin
        .getHooks(compilation)
        .beforeAssetTagGeneration.tap('ExtractHtmlManifestPlugin', data => {
          this.output = this.opts.serialize(data.assets);
        });
    });
    compiler.hooks.afterEmit.tap('ExtractHtmlManifestPlugin', () => {
      var outputFolder = compiler.options.output.path;
      var outputFile = path.resolve(outputFolder, this.opts.fileName);
      fs.writeFileSync(outputFile, this.output, 'utf8');
    });
  }
}

module.exports = ExtractHtmlManifestPlugin;
