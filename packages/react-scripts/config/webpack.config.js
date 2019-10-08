// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

const fs = require('fs');
const isWsl = require('is-wsl');
const webpack = require('webpack');
const resolve = require('resolve');
const webpackMerge = require('webpack-merge');
const PnpWebpackPlugin = require('pnp-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

const paths = require('./paths');
const modules = require('./modules');
const getClientEnvironment = require('./env');
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin');
const ForkTsCheckerWebpackPlugin = require('react-dev-utils/ForkTsCheckerWebpackPlugin');
const typescriptFormatter = require('react-dev-utils/typescriptFormatter');

const appPackageJson = require(paths.appPackageJson);

// Source maps are resource heavy and can cause out of memory issue for large source files.
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';
// Some apps do not need the benefits of saving a web request, so not inlining the chunk
// makes for a smoother build process.
const shouldInlineRuntimeChunk = process.env.INLINE_RUNTIME_CHUNK !== 'false';
const imageInlineSizeLimit = parseInt(
  process.env.IMAGE_INLINE_SIZE_LIMIT || '10000'
);

// Check if TypeScript is setup
const useTypeScript = fs.existsSync(paths.appTsConfig);

// This is the production and development configuration.
// It is focused on developer experience, fast rebuilds, and a minimal bundle.
module.exports = function(webpackEnv) {
  const isEnvDevelopment = webpackEnv === 'development';
  const isEnvProduction = webpackEnv === 'production';
  const mode = isEnvProduction
    ? 'production'
    : isEnvDevelopment && 'development';

  // Variable used for enabling profiling in Production
  // passed into alias object. Uses a flag if passed into the build command
  const isEnvProductionProfile =
    isEnvProduction && process.argv.includes('--profile');

  // Webpack uses `publicPath` to determine where the app is being served from.
  // It requires a trailing slash, or the file assets will get an incorrect path.
  // In development, we always serve from the root. This makes config easier.
  const publicPath = isEnvProduction
    ? paths.servedPath
    : isEnvDevelopment && '/';
  // Some apps do not use client-side routing with pushState.
  // For these, "homepage" can be set to "." to enable relative asset paths.
  const shouldUseRelativeAssetPaths = publicPath === './';

  // `publicUrl` is just like `publicPath`, but we will provide it to our app
  // as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
  // Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
  const publicUrl = isEnvProduction
    ? publicPath.slice(0, -1)
    : isEnvDevelopment && '';
  // Get environment variables to inject into our app.
  const env = getClientEnvironment(publicUrl);

  // Some env specific flags are shared between rules, production, development, and the base configs.
  // We store them in an object we can pass to each configuration
  const envConfigOptions = {
    isEnvProduction,
    isEnvDevelopment,
    shouldUseRelativeAssetPaths,
    shouldUseSourceMap,
    shouldInlineRuntimeChunk,
    imageInlineSizeLimit,
    isWsl,
    publicUrl,
    mode,
  };

  // Returns either the development or production webpack config based on the current mode
  const modeConfig = require(`./webpack.${mode}.js`);

  // These are the module rules which contain webpack loaders. They are stored in
  // a separate file for manageability.
  const moduleRules = require('./webpack.rules.js')(envConfigOptions);

  // webpackMerge performs an Object.assign() on config objects but in a "webpack safe" way
  // respecting the order of loaders and plugins.
  return webpackMerge(
    // This config is the "shared" or "base" webpack config.
    // Anything that you would like to extend to _both_ production and
    // development envrionments will go here. NOTE: If you would like to only extend behavior for production
    // or development mode, then please go to webpack.production.js or webpack.development.js
    {
      mode,
      // https://webpack.js.org/configuartion/output
      output: {
        publicPath,
        // TODO: remove this when upgrading to webpack 5
        futureEmitAssets: true,
        // Prevents conflicts when multiple Webpack runtimes (from different apps)
        // are used on the same page.
        jsonpFunction: `webpackJsonp${appPackageJson.name}`,
      },
      // https://webpack.js.org/configuartion/optimization
      optimization: {
        splitChunks: {
          name: false,
          chunks: 'all',
        },
        // Keep the runtime chunk separated to enable long term caching
        // https://twitter.com/wSokra/status/969679223278505985
        runtimeChunk: true,
      },
      resolve: {
        // https://github.com/facebook/create-react-app/issues/253
        modules: ['node_modules', paths.appNodeModules].concat(
          modules.additionalModulePaths || []
        ),
        // https://github.com/facebook/create-react-app/issues/290
        // `web` extension prefixes have been added for better support
        // for React Native Web.
        extensions: paths.moduleFileExtensions
          .map(ext => `.${ext}`)
          .filter(ext => useTypeScript || !ext.includes('ts')),
        alias: {
          // Support React Native Web
          // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
          'react-native': 'react-native-web',
        },
        plugins: [
          // Adds support for installing with Plug'n'Play, leading to faster installs and adding
          // guards against forgotten dependencies and such.
          PnpWebpackPlugin,
          // Prevents users from importing files from outside of src/ (or node_modules/).
          // This often causes confusion because we only process files within src/ with babel.
          // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
          // please link the files into your node_modules/ and let module-resolution kick in.
          // Make sure your source files are compiled, as they will not be processed in any way.
          new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
        ],
      },
      resolveLoader: {
        plugins: [
          // Also related to Plug'n'Play, but this time it tells Webpack to load its loaders
          // from the current package.
          PnpWebpackPlugin.moduleLoader(module),
        ],
      },
      module: {
        strictExportPresence: true,
        // The default module rules are foudn in ./webpack.rules.js beacuse they are
        // quite lengthy. If you want to modify them, you will need to go to that file.
        // If you are just looking to extend the current rules (add a new loader, etc.) then you
        // can do so here.
        rules: [...moduleRules],
      },
      plugins: [
        // Makes some environment variables available in index.html.
        // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
        // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
        // In production, it will be an empty string unless you specify "homepage"
        // in `package.json`, in which case it will be the pathname of that URL.
        // In development, this will be an empty string.
        new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
        // This gives some necessary context to module not found errors, such as
        // the requesting resource.
        new ModuleNotFoundPlugin(paths.appPath),
        // Makes some environment variables available to the JS code, for example:
        // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
        // It is absolutely essential that NODE_ENV is set to production
        // during a production build.
        // Otherwise React will be compiled in the very slow development mode.
        new webpack.DefinePlugin(env.stringified),
        // Generate a manifest file which contains a mapping of all asset filenames
        // to their corresponding output file so that tools can pick it up without
        // having to parse `index.html`.
        new ManifestPlugin({
          fileName: 'asset-manifest.json',
          publicPath: publicPath,
          generate: (seed, files) => {
            const manifestFiles = files.reduce(function(manifest, file) {
              manifest[file.name] = file.path;
              return manifest;
            }, seed);
            return {
              files: manifestFiles,
            };
          },
        }),
        // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
        // You can remove this if you don't use Moment.js:
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        // TypeScript type checking
        useTypeScript &&
          new ForkTsCheckerWebpackPlugin({
            typescript: resolve.sync('typescript', {
              basedir: paths.appNodeModules,
            }),
            async: isEnvDevelopment,
            useTypescriptIncrementalApi: true,
            checkSyntacticErrors: true,
            resolveModuleNameModule: process.versions.pnp
              ? `${__dirname}/pnpTs.js`
              : undefined,
            resolveTypeReferenceDirectiveModule: process.versions.pnp
              ? `${__dirname}/pnpTs.js`
              : undefined,
            tsconfig: paths.appTsConfig,
            reportFiles: [
              '**',
              '!**/__tests__/**',
              '!**/?(*.)(spec|test).*',
              '!**/src/setupProxy.*',
              '!**/src/setupTests.*',
            ],
            silent: true,
            // The formatter is invoked directly in WebpackDevServerUtils during development
            formatter: isEnvProduction ? typescriptFormatter : undefined,
          }),
      ].filter(Boolean),
      // Some libraries import Node modules but don't use them in the browser.
      // Tell Webpack to provide empty mocks for them so importing them works.
      node: {
        module: 'empty',
        dgram: 'empty',
        dns: 'mock',
        fs: 'empty',
        http2: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty',
      },
      // Turn off performance processing because we utilize
      // our own hints via the FileSizeReporter
      performance: false,
    },
    modeConfig(envConfigOptions)
  );
};
