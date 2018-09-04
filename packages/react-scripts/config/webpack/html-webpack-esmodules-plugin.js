'use strict';

const path = require('path');

const fs = require('fs-extra');

const ID = 'html-webpack-esmodules-plugin';

const safariFix = `(function(){var d=document;var c=d.createElement('script');if(!('noModule' in c)&&'onbeforeload' in c){var s=!1;d.addEventListener('beforeload',function(e){if(e.target===c){s=!0}else if(!e.target.hasAttribute('nomodule')||!s){return}e.preventDefault()},!0);c.type='module';c.src='.';d.head.appendChild(c);c.remove()}}())`;

class HtmlWebpackEsmodulesPlugin {
  constructor() {}

  apply(compiler) {
    compiler.hooks.compilation.tap(ID, compilation => {
      compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(
        ID,
        (data, cb) => {
          const targetDir = compiler.options.output.path;
          // get stats, write to disk
          const htmlName = path.basename(data.plugin.options.filename);
          // Watch out for output files in sub directories
          const htmlPath = path.dirname(data.plugin.options.filename);
          const tempFilename = path.join(
            targetDir,
            htmlPath,
            `assets-${htmlName}.json`
          );

          if (!fs.existsSync(tempFilename)) {
            fs.mkdirpSync(path.dirname(tempFilename));
            fs.writeFileSync(
              tempFilename,
              JSON.stringify(
                data.body.filter(a => a.tagName === 'script' && a.attributes)
              )
            );
            return cb();
          }

          const legacyAssets = JSON.parse(
            fs.readFileSync(tempFilename, 'utf-8')
          );
          legacyAssets.forEach(a => {
            a.attributes.nomodule = '';
          });

          data.body.forEach(tag => {
            if (tag.tagName === 'script' && tag.attributes) {
              tag.attributes.type = 'module';
            }
          });

          data.body.push({
            tagName: 'script',
            closeTag: true,
            innerHTML: safariFix,
          });

          data.body.push(...legacyAssets);

          fs.removeSync(tempFilename);

          cb();
        }
      );

      compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tap(ID, data => {
        data.html = data.html.replace(/\snomodule="">/g, ' nomodule>');
      });
    });
  }
}

module.exports = HtmlWebpackEsmodulesPlugin;
