'use strict';

const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const glob = require('glob');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const eslintFormatter = require('@lighting-beetle/lighter-react-dev-utils/eslintFormatter');
const ModuleScopePlugin = require('@lighting-beetle/lighter-react-dev-utils/ModuleScopePlugin');
const paths = require('./paths');
const getClientEnvironment = require('./env');

const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const FilterWarningsPLugin = require('webpack-filter-warnings-plugin');

// Webpack uses `publicPath` to determine where the app is being served from.
// It requires a trailing slash, or the file assets will get an incorrect path.
const publicPath = paths.servedPath;
// Some apps do not use client-side routing with pushState.
// For these, "homepage" can be set to "." to enable relative asset paths.
const shouldUseRelativeAssetPaths = publicPath === './';
// Source maps are resource heavy and can cause out of memory issue for large source files.
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
const publicUrl = publicPath.slice(0, -1);
// Get environment variables to inject into our app.
const env = getClientEnvironment(publicUrl);

// Assert this just to be safe.
// Development builds of React are slow and not intended for production.
if (env.stringified['process.env'].NODE_ENV !== '"production"') {
  throw new Error('Production builds must have NODE_ENV=production.');
}

// Note: defined here because it will be used more than once.
const cssFilename = getPath => getPath('[name].css').replace('index', 'style');

// ExtractTextPlugin expects the build output to be flat.
// (See https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/27)
// However, our output is structured with css, js and media folders.
// To have this structure working with relative paths, we have to use custom options.
const extractTextPluginOptions = shouldUseRelativeAssetPaths
  ? // Making sure that the publicPath goes back to to build folder.
    { publicPath: Array(cssFilename.split('/').length).join('../') }
  : {};

const extractSass = new ExtractTextPlugin(
  Object.assign(
    {},
    {
      filename: cssFilename
    },
    extractTextPluginOptions
  )
);

const svgoLoader = {
  loader: require.resolve('svgo-loader'),
  options: {
    plugins: [
      { cleanupIDs: true },
      { cleanupAttrs: true },
      { removeComments: true },
      { removeMetadata: true },
      { removeUselessDefs: true },
      { removeEditorsNSData: true },
      { convertStyleToAttrs: true },
      { convertPathData: true },
      { convertTransform: true },
      { collapseGroups: true },
      { mergePaths: true },
      { convertShapeToPath: true },
      { removeStyleElement: true }
    ]
  }
};

// Create dynamic entries based on contents of components directory
const componentsEntryFiles = [].concat(
  glob.sync(path.join(paths.componentsDir, '/*.js')),
  glob.sync(path.join(paths.componentsDir, '/**/index.js')),
  glob.sync(path.join(paths.componentsDir, '/**/*.static.js'))
);

const patternsEntryFiles = [].concat(
  glob.sync(path.join(paths.patternsDir, '/**/index.js'))
);

function getEntries(type, dirPath, entryFiles) {
  return entryFiles.reduce((entries, entryFile) => {
    // converts entryFile path to platform specific style
    // this fixes windows/unix path inconsitence
    // because node-glob always returns path with unix style path separators
    entryFile = path.join(entryFile);
    
    const localPath = entryFile.split(dirPath)[1];

    let entryName = path.join(type, localPath.split('.js')[0]);

    entries[entryName] = path.join(dirPath, localPath);

    return entries;
  }, {});
}

// create entries as object from entry files
const entries = Object.assign(
  {},
  getEntries('components', paths.componentsDir, componentsEntryFiles),
  getEntries('patterns', paths.patternsDir, patternsEntryFiles)
);

// This is the production configuration.
// It compiles slowly and is focused on producing a fast and minimal bundle.
// The development configuration is different and lives in a separate file.
module.exports = {
  // Don't attempt to continue if there are any errors.
  bail: true,
  // We generate sourcemaps in production. This is slow but gives good results.
  // You can exclude the *.map files from the build during deployment.
  devtool: shouldUseSourceMap ? 'source-map' : false,
  // Dynamic entries
  entry: entries,
  output: {
    // The build folder.
    path: paths.appBuild,
    // Generated JS file names (with nested folders).
    // There will be one main bundle, and one file per asynchronous chunk.
    // We don't currently advertise code splitting but Webpack supports it.
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
    // We inferred the "public path" (such as / or /my-project) from homepage.
    publicPath: publicPath,
    // Point sourcemap entries to original disk location (format as URL on Windows)
    devtoolModuleFilenameTemplate: info =>
      path
        .relative(paths.appSrc, info.absoluteResourcePath)
        .replace(/\\/g, '/'),

    libraryTarget: 'umd'
  },
  externals: {
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react'
    },
    'react-dom': {
      root: 'ReactDOM',
      commonjs2: 'react-dom',
      commonjs: 'react-dom',
      amd: 'react-dom'
    }
  },
  resolve: {
    // This allows you to set a fallback for where Webpack should look for modules.
    // We placed these paths second because we want `node_modules` to "win"
    // if there are any conflicts. This matches Node resolution mechanism.
    // https://github.com/facebookincubator/create-react-app/issues/253
    modules: ['node_modules', paths.appNodeModules].concat(
      // It is guaranteed to exist because we tweak it in `env.js`
      process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
    ),
    // These are the reasonable defaults supported by the Node ecosystem.
    // We also include JSX as a common component filename extension to support
    // some tools, although we do not recommend using it, see:
    // https://github.com/facebookincubator/create-react-app/issues/290
    // `web` extension prefixes have been added for better support
    // for React Native Web.
    extensions: ['.web.js', '.mjs', '.js', '.json', '.web.jsx', '.jsx'],
    alias: {
      // @remove-on-eject-begin
      // Resolve Babel runtime relative to react-scripts.
      // It usually still works on npm 3 without this but it would be
      // unfortunate to rely on, as react-scripts could be symlinked,
      // and thus babel-runtime might not be resolvable from the source.
      'babel-runtime': path.dirname(
        require.resolve('babel-runtime/package.json')
      ),
      // @remove-on-eject-end
      // Support React Native Web
      // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
      'react-native': 'react-native-web'
    },
    plugins: [
      // Prevents users from importing files from outside of src/ (or node_modules/).
      // This often causes confusion because we only process files within src/ with babel.
      // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
      // please link the files into your node_modules/ and let module-resolution kick in.
      // Make sure your source files are compiled, as they will not be processed in any way.
      new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson])
    ]
  },
  module: {
    strictExportPresence: true,
    rules: [
      // TODO: Disable require.ensure as it's not a standard language feature.
      // We are waiting for https://github.com/facebookincubator/create-react-app/issues/2176.
      // { parser: { requireEnsure: false } },

      // First, run the linter.
      // It's important to do this before Babel processes the JS.
      {
        test: /\.(js|jsx|mjs)$/,
        enforce: 'pre',
        use: [
          {
            options: {
              formatter: eslintFormatter,
              eslintPath: require.resolve(
                path.join(paths.appNodeModules, 'eslint')
              ),
              // @remove-on-eject-begin
              ignore: false,
              useEslintrc: true,
              fix: true
              // @remove-on-eject-end
            },
            loader: require.resolve('eslint-loader')
          }
        ],
        include: paths.appSrc
      },
      {
        // "oneOf" will traverse all following loaders until one will
        // match the requirements. When no loader matches it will fall
        // back to the "file" loader at the end of the loader list.
        oneOf: [
          // "url" loader works just like "file" loader but it also embeds
          // assets smaller than specified size as data URLs to avoid requests.
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000,
              name: '[name].[ext]'
            }
          },
          // Process JS with Babel.
          {
            test: /\.(js|jsx|mjs)$/,
            include: [
              paths.appSrc,
              path.join(paths.appNodeModules, 'stringify-object'),
              fs.realpathSync(
                path.join(
                  paths.appNodeModules,
                  '@lighting-beetle',
                  'lighter-styleguide'
                )
              )
            ],
            loader: require.resolve('babel-loader'),
            options: {
              // @remove-on-eject-begin
              babelrc: false,
              presets: [require.resolve('babel-preset-react-app')],
              plugins: [
                [
                  require('babel-plugin-transform-react-remove-prop-types')
                    .default,
                  {
                    removeImport: true
                  }
                ]
              ],
              // @remove-on-eject-end
              compact: true
            }
          },
          // "file" loader makes sure assets end up in the `build` folder.
          // When you `import` an asset, you get its filename.
          // This loader doesn't use a "test" so it will catch all modules
          // that fall through the other loaders.
          {
            loader: require.resolve('file-loader'),
            // Exclude `js` files to keep "css" loader working as it injects
            // it's runtime that would otherwise processed through "file" loader.
            // Also exclude `html` and `json` extensions so they get processed
            // by webpacks internal loaders.
            exclude: [
              /\.(js|jsx|mjs)$/,
              /\.html$/,
              /\.json$/,
              /\.css/,
              /\.scss$/,
              paths.icons
            ],
            options: {
              name: '[name].[ext]'
            }
          }
        ]
      },
      // ** STOP ** Are you adding a new loader?
      // Make sure to add the new loader(s) before the "file" loader.
      {
        test: [/\.scss$/, /\.css$/],
        use: extractSass.extract({
          use: [
            {
              loader: require.resolve('css-loader'),
              options: { importLoaders: 1 }
            },
            {
              loader: require.resolve('postcss-loader'),
              options: {
                plugins: [
                  require('postcss-flexbugs-fixes')(),
                  require('autoprefixer')(),
                  require('postcss-inline-svg')(),
                  require('postcss-reporter')({
                    clearReportedMessages: true,
                    throwError: true
                  }),
                  require('cssnano')({
                    reduceIdents: false,
                    discardUnused: { fontFace: false },
                  }),
                ]
              }
            },
            {
              loader: require.resolve('sass-loader'),
              options: {
                includePaths: [paths.styles]
              }
            }
          ],
          fallback: require.resolve('style-loader')
        })
      },
      {
        test: /\.svg$/,
        include: paths.icons,
        use: [
          {
            loader: require.resolve('svg-sprite-loader'),
            options: {
              extract: true,
              spriteFilename: 'sprite.svg'
            }
          },
          svgoLoader
        ]
      }
    ]
  },
  plugins: [
    // Makes some environment variables available to the JS code, for example:
    // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
    // It is absolutely essential that NODE_ENV was set to production here.
    // Otherwise React will be compiled in the very slow development mode.
    new webpack.DefinePlugin(env.stringified),
    // Minify the code.
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          warnings: false,
          // Disabled because of an issue with Uglify breaking seemingly valid code:
          // https://github.com/facebookincubator/create-react-app/issues/2376
          // Pending further investigation:
          // https://github.com/mishoo/UglifyJS2/issues/2011
          comparisons: false
        },
        mangle: {
          safari10: true
        },
        output: {
          comments: false,
          // Turned on because emoji and regex is not minified properly using default
          // https://github.com/facebookincubator/create-react-app/issues/2488
          ascii_only: true
        }
      },
      // Use multi-process parallel running to improve the build speed
      // Default number of concurrent runs: os.cpus().length - 1
      parallel: true,
      // Enable file caching
      cache: true,
      sourceMap: shouldUseSourceMap
    }),
    // Note: this won't work without ExtractTextPlugin.extract(..) in `loaders`.
    new ExtractTextPlugin({
      filename: cssFilename
    }),
    // Generate a manifest file which contains a mapping of all asset filenames
    // to their corresponding output file so that tools can pick it up without
    // having to parse `index.html`.
    new ManifestPlugin({
      fileName: 'asset-manifest.json'
    }),
    // Moment.js is an extremely popular library that bundles large locale files
    // by default due to how Webpack interprets its code. This is a practical
    // solution that requires the user to opt into importing specific locales.
    // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
    // You can remove this if you don't use Moment.js:
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    extractSass,
    new StyleLintPlugin({
      files: [path.join(paths.appSrc, '**/*.scss')]
    }),
    new SpriteLoaderPlugin({ plainSprite: true }),
    new FilterWarningsPLugin({
      exclude: /svg-sprite-loader exception. 2 rules applies to/
    })
  ],
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
};
