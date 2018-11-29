/* eslint-disable */
const path = require('path');
const clientRoot = path.resolve(path.resolve(__dirname));
const paths = require('./paths');
const getClientEnvironment = require('./env');
const publicPath = paths.servedPath;
const publicUrl = publicPath.slice(0, -1);
const env = getClientEnvironment(publicUrl);
const webpack = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const TerserPlugin = require('terser-webpack-plugin');
// const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
const getCacheIdentifier = require('react-dev-utils/getCacheIdentifier');
const happyPack = process.env.HAPPY_PACK === 'true';
// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;
const compiler = webpack(getWebpackConfig());
const chalk = require('chalk').default;
// Check if TypeScript is setup
// const useTypeScript = fs.existsSync(paths.appTsConfig);
compiler.run((err, stats) => {
  if (err || stats.hasErrors()) {
    console.log(stats.compilation.errors);
    console.log(chalk.red('ssr build failed.'));
  } else {
    console.log(
      chalk.green('\nAsserts for server render compiled successfully:')
    );
    Object.keys(stats.compilation.assets).forEach(name => {
      if (/\.js$/.test(name)) {
        console.log(chalk.whiteBright(name));
      }
    });
    console.log('\n');
  }
});

function getWebpackConfig() {
  return {
    mode: 'development',
    context: path.resolve(clientRoot),
    entry: [path.resolve(paths.srcPaths, paths.appIndexJsSSR)],

    devtool: 'cheap-module-source-map',
    watch: true,
    watchOptions: {
      aggregateTimeout: 500,
      ignored: [/node_modules/]
    },
    target: 'node',
    output: {
      path: paths.appPath,
      pathinfo: true,
      filename: './build/static/bundle.ssr.js',
      chunkFilename: './build/static/[name].ssr.js',
      publicPath: '/',
      // devtoolModuleFilenameTemplate: info =>
      //   path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
      libraryTarget: 'commonjs'
    },
    optimization: {
      splitChunks: false,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            parse: {
              // we want terser to parse ecma 8 code. However, we don't want it
              // to apply any minfication steps that turns valid ecma 5 code
              // into invalid ecma 5 code. This is why the 'compress' and 'output'
              // sections only apply transformations that are ecma 5 safe
              // https://github.com/facebook/create-react-app/pull/4234
              ecma: 8
            },
            mangle: {
              safari10: true
            },
            output: {
              ecma: 5,
              comments: false,
              // Turned on because emoji and regex is not minified properly using default
              // https://github.com/facebook/create-react-app/issues/2488
              ascii_only: true
            }
          },
          // Use multi-process parallel running to improve the build speed
          // Default number of concurrent runs: os.cpus().length - 1
          parallel: true,
          // Enable file caching
          cache: true,
          sourceMap: false
        })
      ]
    },
    resolve: {
      extensions: [
        '.web.ts',
        '.ts',
        '.web.tsx',
        '.tsx',
        '.web.js',
        '.js',
        '.json',
        '.web.jsx',
        '.jsx'
      ],
      plugins: [
        new ModuleScopePlugin(paths.appSrc, [
          path.resolve(paths.appPath, 'package.json')
        ]),
        new TsconfigPathsPlugin({ configFile: paths.appTsSSRConfig })
      ]
    },
    module: {
      rules: [
        // Disable require.ensure as it's not a standard language feature.
        { parser: { requireEnsure: false } },

        // First, run the linter.
        // It's important to do this before Babel processes the JS.
        {
          // "oneOf" will traverse all following loaders until one will
          // match the requirements. When no loader matches it will fall
          // back to the "file" loader at the end of the loader list.
          oneOf: [
            // "url" loader works like "file" loader except that it embeds assets
            // smaller than specified limit in bytes as data URLs to avoid requests.
            // A missing `test` is equivalent to a match.
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              loader: require.resolve('url-loader'),
              options: {
                limit: 10000,
                name: 'static/media/[name].[hash:8].[ext]'
              }
            },
            // Process application JS with Babel.
            // The preset includes JSX, Flow, and some ESnext features.
            {
              test: /\.(js|jsx|mjs)$/,
              include: paths.srcPaths,
              loader: require.resolve('babel-loader'),
              options: {
                customize: require.resolve(
                  'babel-preset-react-app/webpack-overrides'
                ),
                // @remove-on-eject-begin
                babelrc: false,
                configFile: false,
                presets: [require.resolve('babel-preset-react-app')],
                cacheIdentifier: getCacheIdentifier('development', [
                  'babel-plugin-named-asset-import',
                  'babel-preset-react-app',
                  'react-dev-utils',
                  'react-scripts'
                ]),
                // @remove-on-eject-end
                plugins: [
                  [
                    require.resolve('babel-plugin-named-asset-import'),
                    {
                      loaderMap: {
                        svg: {
                          ReactComponent: '@svgr/webpack?-prettier,-svgo![path]'
                        }
                      }
                    }
                  ]
                ],
                // This is a feature of `babel-loader` for webpack (not Babel itself).
                // It enables caching results in ./node_modules/.cache/babel-loader/
                // directory for faster rebuilds.
                cacheDirectory: true,
                // Don't waste time on Gzipping the cache
                cacheCompression: false
              }
            },
            {
              test: /\.(js|mjs)$/,
              exclude: /@babel(?:\/|\\{1,2})runtime/,
              loader: require.resolve('babel-loader'),
              options: {
                babelrc: false,
                configFile: false,
                compact: false,
                presets: [
                  [
                    require.resolve('babel-preset-react-app/dependencies'),
                    { helpers: true }
                  ]
                ],
                cacheDirectory: true,
                // Don't waste time on Gzipping the cache
                cacheCompression: false,
                // @remove-on-eject-begin
                cacheIdentifier: getCacheIdentifier('development', [
                  'babel-plugin-named-asset-import',
                  'babel-preset-react-app',
                  'react-dev-utils',
                  'react-scripts'
                ]),
                // If an error happens in a package, it's possible to be
                // because it was compiled. Thus, we don't want the browser
                // debugger to show the original code. Instead, the code
                // being evaluated would be much more helpful.
                // @remove-on-eject-end
                sourceMaps: false
              }
            },
            {
              test: /\.tsx?$/,
              include: paths.srcPaths,
              exclude: /[\\/]node_modules[\\/]/,
              use: [
                {
                  loader: require.resolve('babel-loader'),
                  options: {
                    cacheCompression: false,
                    sourceMaps: false,
                    plugins: [
                      require.resolve('babel-plugin-dynamic-import-node'),
                      [
                        require.resolve('babel-plugin-named-asset-import'),
                        {
                          loaderMap: {
                            svg: {
                              ReactComponent:
                                '@svgr/webpack?-prettier,-svgo![path]'
                            }
                          }
                        }
                      ]
                    ]
                  }
                },
                {
                  loader: require.resolve('ts-loader'),
                  options: {
                    happyPackMode: happyPack,
                    getCustomTransformers: require.resolve(
                      './webpack.ts-transformers.js'
                    )
                  }
                }
              ]
            },
            {
              test: cssRegex,
              exclude: cssModuleRegex,
              use: [path.resolve(__dirname, './ssr/style-loader')]
            },
            // Adds support for CSS Modules (https://github.com/css-modules/css-modules)
            // using the extension .module.css
            {
              test: cssModuleRegex,
              use: [path.resolve(__dirname, './ssr/style-loader')]
            },
            {
              test: sassRegex,
              exclude: sassModuleRegex,
              use: [path.resolve(__dirname, './ssr/style-loader')]
            },
            {
              test: sassModuleRegex,
              use: [path.resolve(__dirname, './ssr/style-loader')]
            },
            {
              test: /\.less$/,
              exclude: sassModuleRegex,
              use: [path.resolve(__dirname, './ssr/style-loader')]
            },
            {
              test: /\.module\.less$/,
              use: [path.resolve(__dirname, './ssr/style-loader')]
            },
            {
              exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
              loader: require.resolve('file-loader'),
              options: {
                name: 'static/media/[name].[hash:8].[ext]'
              }
            }
          ]
        }
        // ** STOP ** Are you adding a new loader?
        // Make sure to add the new loader(s) before the "file" loader.
      ]
    },
    plugins: [
      new webpack.DefinePlugin(
        Object.assign({}, env.stringified, {
          'process.env.NODE_ENV': JSON.stringify('production'),
          'process.env.REACT_APP_IN_NODE': JSON.stringify('true')
        })
      ),
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    ],
    node: {
      dgram: 'empty',
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
      window: 'mock'
    },
    performance: false
  };
}

function getStyleLoaders(_cssOptions, _preProcessor) {
  const loaders = [path.resolve(__dirname, 'ssr/style-loader')];
  return loaders;
}
