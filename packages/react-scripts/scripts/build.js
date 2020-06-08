// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Ensure environment variables are read.
require('../config/env');
// @remove-on-eject-begin
// Do the preflight checks (only happens before eject).
const verifyPackageTree = require('./utils/verifyPackageTree');
if (process.env.SKIP_PREFLIGHT_CHECK !== 'true') {
  verifyPackageTree();
}
const verifyTypeScriptSetup = require('./utils/verifyTypeScriptSetup');
verifyTypeScriptSetup();
// @remove-on-eject-end

const path = require('path');
const chalk = require('react-dev-utils/chalk');
const fs = require('fs-extra');
const bfj = require('bfj');
const webpack = require('webpack');
const configFactory = require('../config/webpack.config');
const paths = require('../config/paths');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const printHostingInstructions = require('react-dev-utils/printHostingInstructions');
const FileSizeReporter = require('react-dev-utils/FileSizeReporter');
const printBuildError = require('react-dev-utils/printBuildError');

const measureFileSizesBeforeBuild =
  FileSizeReporter.measureFileSizesBeforeBuild;
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild;
const useYarn = fs.existsSync(paths.yarnLockFile);

// These sizes are pretty large. We'll warn for bundles exceeding them.
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;

const isInteractive = process.stdout.isTTY;

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1);
}

const argv = process.argv.slice(2);
const writeStatsJson = argv.indexOf('--stats') !== -1;

// Generate configuration
const config = configFactory('production');

// We require that you explicitly set browsers and do not fall back to
// browserslist defaults.
const { checkBrowsers } = require('react-dev-utils/browsersHelper');
checkBrowsers(paths.appPath, isInteractive)
  .then(() => {
    // First, read the current file sizes in build directory.
    // This lets us display how much they changed later.
    return measureFileSizesBeforeBuild(paths.appBuild);
  })
  .then(previousFileSizes => {
    // Remove all content but keep the directory so that
    // if you're in it, you don't end up in Trash
    fs.emptyDirSync(paths.appBuild);
    // Merge with the public folder
    copyPublicFolder();
    // Start the webpack build
    return build(previousFileSizes);
  })
  .then(
    ({ stats, previousFileSizes, warnings }) => {
      if (warnings.length) {
        console.log(chalk.yellow('Compiled with warnings.\n'));
        console.log(warnings.join('\n\n'));
        console.log(
          '\nSearch for the ' +
            chalk.underline(chalk.yellow('keywords')) +
            ' to learn more about each warning.'
        );
        console.log(
          'To ignore, add ' +
            chalk.cyan('// eslint-disable-next-line') +
            ' to the line before.\n'
        );
      } else {
        console.log(chalk.green('Compiled successfully.\n'));
      }

      console.log('File sizes after gzip:\n');
      printFileSizesAfterBuild(
        stats,
        previousFileSizes,
        paths.appBuild,
        WARN_AFTER_BUNDLE_GZIP_SIZE,
        WARN_AFTER_CHUNK_GZIP_SIZE
      );
      console.log();

      const appPackage = require(paths.appPackageJson);
      const publicUrl = paths.publicUrlOrPath;
      const publicPath = config.output.publicPath;
      const buildFolder = path.relative(process.cwd(), paths.appBuild);
      printHostingInstructions(
        appPackage,
        publicUrl,
        publicPath,
        buildFolder,
        useYarn
      );
    },
    err => {
      const tscCompileOnError = process.env.TSC_COMPILE_ON_ERROR === 'true';
      if (tscCompileOnError) {
        console.log(
          chalk.yellow(
            'Compiled with the following type errors (you may want to check these before deploying your app):\n'
          )
        );
        printBuildError(err);
      } else {
        console.log(chalk.red('Failed to compile.\n'));
        printBuildError(err);
        process.exit(1);
      }
    }
  )
  .catch(err => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });

// Create the production build and print the deployment instructions.
function build(previousFileSizes) {
  console.log(chalk.cyan('Creating an optimized production app build...'));

  const compiler = webpack(config);
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      let messages;
      if (err) {
        if (!err.message) {
          return reject(err);
        }

        let errMessage = err.message;

        // Add additional information for postcss errors
        if (Object.prototype.hasOwnProperty.call(err, 'postcssNode')) {
          errMessage +=
            '\nCompileError: Begins at CSS selector ' +
            err['postcssNode'].selector;
        }

        messages = formatWebpackMessages({
          errors: [errMessage],
          warnings: [],
        });
      } else {
        messages = formatWebpackMessages(
          stats.toJson({ all: false, warnings: true, errors: true })
        );
      }
      if (messages.errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
          messages.errors.length = 1;
        }
        return reject(new Error(messages.errors.join('\n\n')));
      }
      if (
        process.env.CI &&
        (typeof process.env.CI !== 'string' ||
          process.env.CI.toLowerCase() !== 'false') &&
        messages.warnings.length
      ) {
        console.log(
          chalk.yellow(
            '\nTreating warnings as errors because process.env.CI = true.\n' +
              'Most CI servers set it automatically.\n'
          )
        );
        return reject(new Error(messages.warnings.join('\n\n')));
      }

      const resolveArgs = {
        stats,
        previousFileSizes,
        warnings: messages.warnings,
      };

      if (writeStatsJson) {
        return bfj
          .write(paths.appBuild + '/bundle-stats.json', stats.toJson())
          .then(() => resolve(resolveArgs))
          .catch(error => reject(new Error(error)));
      }

      return resolve(resolveArgs);
    });
  }).then(buildWidgets);
}

function copyPublicFolder() {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: file => file !== paths.appHtml,
  });
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

function addaptWebpackConfigForWidget(widgetPath, widgetName) {
  const config = configFactory('production');

  /** For some reason, we need to disable the splitChunks and runtimeChunk for widgets to work */
  config.optimization.splitChunks = {
    cacheGroups: {
      default: false,
    },
  };

  config.optimization.runtimeChunk = false;

  config.entry = [
    `${paths.appPath}/src/web-widgets/utils/remote-route.js`,
    widgetPath,
  ];

  config.output.filename = config.output.filename.replace(
    'static/',
    `widgets/${widgetName}/static/`
  );

  config.output.chunkFilename = config.output.chunkFilename.replace(
    'static/',
    `widgets/${widgetName}/static/`
  );

  config.module.rules.map(rule => {
    if (rule.oneOf) {
      rule.oneOf.forEach(oneOfRule => {
        if (oneOfRule.options) {
          for (let key in oneOfRule.options) {
            if (key === 'name') {
              oneOfRule.options[key] = oneOfRule.options[key].replace(
                'static/media/',
                `widgets/${widgetName}/static/media/`
              );
            }
          }
        }
      });
    }

    return rule;
  });

  // Remove some plugins which are not needed for the widget builds
  config.plugins = config.plugins.filter(plugin => {
    const pluginName = plugin.constructor.name;
    const pluginsToRemove = ['HtmlWebpackPlugin', 'GenerateSW'];

    return !pluginsToRemove.includes(pluginName);
  });

  config.plugins = config.plugins.map(plugin => {
    const pluginName = plugin.constructor.name;

    if (pluginName === 'ManifestPlugin') {
      plugin.opts.fileName = plugin.opts.fileName.replace(
        'asset-manifest.json',
        `widgets/${widgetName}/asset-manifest.json`
      );
    }

    if (pluginName === 'MiniCssExtractPlugin') {
      plugin.options.filename = plugin.options.filename.replace(
        'static/css/',
        `widgets/${widgetName}/static/css/`
      );
      plugin.options.chunkFilename = plugin.options.chunkFilename.replace(
        'static/css/',
        `widgets/${widgetName}/static/css/`
      );
    }

    return plugin;
  });

  return webpack(config);
}

async function buildWidgets(buildData) {
  const widgetsMainFilesMap = {};

  console.log(chalk.green('App build is successful!'));
  console.log(chalk.cyan('Creating an optimized production widgets build...'));

  await asyncForEach(paths.widgets, async widgetPath => {
    const widgetName = path.basename(widgetPath).split('.')[0];
    const compiler = addaptWebpackConfigForWidget(widgetPath, widgetName);

    const widgetBuildResult = await new Promise((resolve, reject) => {
      compiler.run((err, stats) => {
        let messages;
        if (err) {
          if (!err.message) {
            return reject(err);
          }

          let errMessage = err.message;

          // Add additional information for postcss errors
          if (Object.prototype.hasOwnProperty.call(err, 'postcssNode')) {
            errMessage +=
              '\nCompileError: Begins at CSS selector ' +
              err['postcssNode'].selector;
          }

          messages = formatWebpackMessages({
            errors: [errMessage],
            warnings: [],
          });
        } else {
          messages = formatWebpackMessages(
            stats.toJson({ all: false, warnings: true, errors: true })
          );
        }
        if (messages.errors.length) {
          // Only keep the first error. Others are often indicative
          // of the same problem, but confuse the reader with noise.
          if (messages.errors.length > 1) {
            messages.errors.length = 1;
          }
          return reject(new Error(messages.errors.join('\n\n')));
        }
        if (
          process.env.CI &&
          (typeof process.env.CI !== 'string' ||
            process.env.CI.toLowerCase() !== 'false') &&
          messages.warnings.length
        ) {
          console.log(
            chalk.yellow(
              '\nTreating warnings as errors because process.env.CI = true.\n' +
                'Most CI servers set it automatically.\n'
            )
          );
          return reject(new Error(messages.warnings.join('\n\n')));
        }

        return resolve({
          widget: widgetName,
          stats,
        });
      });
    });

    const widgetManifestPath = path.join(
      paths.appBuild,
      'widgets',
      widgetBuildResult.widget,
      'asset-manifest.json'
    );
    const widgetManifestContent = JSON.parse(
      fs.readFileSync(widgetManifestPath).toString()
    );

    widgetsMainFilesMap[widgetName] = {
      js: widgetManifestContent.files['main.js'],
      css: widgetManifestContent.files['main.css'],
    };
  });

  const loaderJsPath = path.join(paths.appBuild, 'loader.js');
  let loaderJs = fs.readFileSync(loaderJsPath).toString();

  for (let widgetName in widgetsMainFilesMap) {
    let cssFileName = widgetsMainFilesMap[widgetName].css || false;

    /** We exclude css file from "sharedFunctionalities" since it has no style effects on the page. */
    if (widgetName === 'sharedFunctionalities') {
      cssFileName = false;
    }

    loaderJs = loaderJs.replace(
      `%ENTRY_JS_${widgetName.toUpperCase()}%`,
      `${widgetsMainFilesMap[widgetName].js}`
    );

    loaderJs = loaderJs.replace(
      `%ENTRY_CSS_${widgetName.toUpperCase()}%`,
      cssFileName
    );
  }

  fs.writeFileSync(loaderJsPath, loaderJs);

  console.log(chalk.green('Widgets build is successful!\n'));

  return buildData;
}
