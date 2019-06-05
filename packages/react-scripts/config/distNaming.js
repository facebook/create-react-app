'use strict';
const chalk = require('react-dev-utils/chalk');

/**
 * @typedef {Object} DistNaming
 * @property {OutputStructure} output Naming patterns for webpack's config output section
 * @property {FileNaming} media Naming pattern for images `webpackConfig.module.rules..oneOf`
 * @property {FileNaming} files Naming patterns for latest in `oneOf` rule – `file-loader`
 * @property {FileNaming} css Naming patterns for MiniCassExtractPlugin
 */

/**
 * @typedef {Object} OutputStructure
 * @property {FileNaming} development
 * @property {FileNaming} production
 */

/**
 * @typedef {Object} FileNaming
 * @property {string} filename
 * @property {string} [chunkFilename]
 */

const env = process.env;
const npmPropertyRegex = /^npm_package_distNaming_(.+)$/;

/**
 * @type DistNaming
 */
const defaultNaming = {
  output: {
    development: {
      filename: 'static/js/bundle.js',
      chunkFilename: 'static/js/[name].chunk.js',
    },
    production: {
      filename: 'static/js/[name].[contenthash:8].js',
      chunkFilename: 'static/js/[name].[contenthash:8].chunk.js',
    },
  },

  media: {
    filename: 'static/media/[name].[hash:8].[ext]',
  },

  files: {
    filename: 'static/media/[name].[hash:8].[ext]',
  },

  css: {
    filename: 'static/css/[name].[contenthash:8].css',
    chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
  },
};

/**
 * @type DistNaming
 */
const structure = Object.entries(env).reduce(setCustomNaming, defaultNaming);

module.exports = structure;

function setCustomNaming(naming, envEntry) {
  const [key, value] = envEntry;

  if (npmPropertyRegex.test(key)) {
    const [, name] = npmPropertyRegex.exec(key);
    const path = name.split('_');

    try {
      return update(naming, path, value);
    } catch (e) {
      throw new Error(e.message + chalk.red(` in ${path.join('.')}`));
    }
  }

  return naming;
}

function update(obj, path, value) {
  const [head, ...tail] = path;

  if (head) {
    if (!obj.hasOwnProperty(head)) {
      throw new Error(chalk.red('Unexpected property ') + chalk.red.bold(head));
    }

    return {
      ...obj,
      [head]: update(obj[head], tail, value),
    };
  } else {
    return value;
  }
}
