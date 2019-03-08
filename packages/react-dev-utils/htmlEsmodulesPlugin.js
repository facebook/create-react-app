'use strict';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs-extra');

const ID = 'html-webpack-esmodules-plugin';

const safariFix = `(function(){var d=document;var c=d.createElement('script');if(!('noModule' in c)&&'onbeforeload' in c){var s=!1;d.addEventListener('beforeload',function(e){if(e.target===c){s=!0}else if(!e.target.hasAttribute('nomodule')||!s){return}e.preventDefault()},!0);c.type='module';c.src='.';d.head.appendChild(c);c.remove()}}())`;

class HtmlWebpackEsmodulesPlugin {
  constructor() {}

  apply(compiler) {
    compiler.hooks.compilation.tap(ID, compilation => {
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync(
        ID,
        ({ plugin, bodyTags: body }, cb) => {
          const targetDir = compiler.options.output.path;
          // get stats, write to disk
          const htmlName = path.basename(plugin.options.filename);
          // Watch out for output files in sub directories
          const htmlPath = path.dirname(plugin.options.filename);
          const tempFilename = path.join(
            targetDir,
            htmlPath,
            `assets-${htmlName}.json`
          );

          if (!fs.existsSync(tempFilename)) {
            fs.mkdirpSync(path.dirname(tempFilename));
            const newBody = body.filter(
              a => a.tagName === 'script' && a.attributes
            );
            newBody.forEach(a => (a.attributes.nomodule = ''));
            fs.writeFileSync(tempFilename, JSON.stringify(newBody));
            return cb();
          }

          const legacyAssets = JSON.parse(
            fs.readFileSync(tempFilename, 'utf-8')
          );
          // TODO: to discuss, an improvement would be to
          // Inject these into the head tag together with the
          // Safari script.
          body.forEach(tag => {
            if (tag.tagName === 'script' && tag.attributes) {
              tag.attributes.type = 'module';
            }
          });

          body.push({
            tagName: 'script',
            closeTag: true,
            innerHTML: safariFix,
          });

          body.push(...legacyAssets);
          fs.removeSync(tempFilename);
          cb();
        }
      );

      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tap(ID, data => {
        data.html = data.html.replace(/\snomodule="">/g, ' nomodule>');
      });
    });
  }
}

module.exports = HtmlWebpackEsmodulesPlugin;
