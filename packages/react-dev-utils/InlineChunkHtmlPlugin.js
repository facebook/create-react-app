/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

class InlineChunkHtmlPlugin {
  constructor(htmlWebpackPlugin, tests) {
    this.htmlWebpackPlugin = htmlWebpackPlugin;
    this.tests = tests;
  }

  static findHtmlWebpackPlugin(plugins) {
    return plugins.find(plugin => plugin.constructor.name === 'HtmlWebpackPlugin');
  }

  getInlinedTag(publicPath, assets, tag, isXhtml) {
    if (tag.tagName !== 'script' || !(tag.attributes && tag.attributes.src)) {
      return tag;
    }
    const scriptName = tag.attributes.src.replace(publicPath, '');
    if (!this.tests.some(test => scriptName.match(test))) {
      return tag;
    }
    const asset = assets[scriptName];
    if (asset == null) {
      return tag;
    }
    let innerHTML = asset.source();
    if (isXhtml) {
      innerHTML = `<![CDATA[${innerHTML}]]>`;
    }

    return { tagName: 'script', innerHTML, closeTag: true };
  }

  apply(compiler) {
    let publicPath = compiler.options.output.publicPath;
    if (!publicPath.endsWith('/')) {
      publicPath += '/';
    }

    const htmlWebpackPlugin = InlineChunkHtmlPlugin.findHtmlWebpackPlugin(compiler.options.plugins);
    let isXhtml = false;
    if (htmlWebpackPlugin) {
      isXhtml = htmlWebpackPlugin.options.xhtml;
    }

    compiler.hooks.compilation.tap('InlineChunkHtmlPlugin', compilation => {
      const tagFunction = tag => this.getInlinedTag(publicPath, compilation.assets, tag, isXhtml);

      const hooks = this.htmlWebpackPlugin.getHooks(compilation);
      hooks.alterAssetTagGroups.tap('InlineChunkHtmlPlugin', assets => {
        assets.headTags = assets.headTags.map(tagFunction);
        assets.bodyTags = assets.bodyTags.map(tagFunction);
      });

      // Still emit the runtime chunk for users who do not use our generated
      // index.html file.
      // hooks.afterEmit.tap('InlineChunkHtmlPlugin', () => {
      //   Object.keys(compilation.assets).forEach(assetName => {
      //     if (this.tests.some(test => assetName.match(test))) {
      //       delete compilation.assets[assetName];
      //     }
      //   });
      // });
    });
  }
}

module.exports = InlineChunkHtmlPlugin;
