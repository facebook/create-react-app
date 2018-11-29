'use strict';

const paths = require('./paths');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
const isProduction = process.env.NODE_ENV === 'production';
const happyPack = process.env.HAPPY_PACK === 'true';
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';
const getClientEnvironment = require('./env');
const env = getClientEnvironment('');
// @remove-on-eject-begin
const getCacheIdentifier = require('react-dev-utils/getCacheIdentifier');
// @remove-on-eject-end

let cssType = 'sass';
// 因为目前项目大多用的 sass 预处理，所以优先判断 sass 兼容
try {
  require.resolve('less-loader');
  cssType = 'less';
} catch (e) {
  void 0;
}

// const useTypeScript = fs.existsSync(paths.appTsConfig);

function getStyleLoader(options) {
  const isLess = options && options.cssType === 'less';
  const isSass = options && options.cssType === 'sass';
  const isModules = options && options.modules;

  let styleRegex = /\.css$/;
  let styleModuleRegex = /\.module\.css$/;
  if (isSass) {
    styleRegex = /\.(scss|sass)$/;
    styleModuleRegex = /\.module\.(scss|sass)$/;
  } else if (isLess) {
    styleRegex = /\.less$/;
    styleModuleRegex = /\.module\.less$/;
  }

  const styleLoader = require.resolve('style-loader');

  const miniCss = MiniCssExtractPlugin.loader;

  const cssLoader = {
    loader: require.resolve('css-loader'),
    options: {
      importLoaders: isLess || isSass ? 2 : 1
    }
  };
  if (isModules) {
    cssLoader.options.modules = true;
    cssLoader.options.getLocalIdent = getCSSModuleLocalIdent;
  }

  const postCssLoader = {
    loader: require.resolve('postcss-loader'),
    options: {
      ident: 'postcss',
      plugins: () =>
        [
          require('postcss-flexbugs-fixes'),
          require('postcss-preset-env')({
            autoprefixer: {
              flexbox: 'no-2009'
            },
            stage: 3
          }),
          env.raw.REACT_APP_REM_UNIT &&
            require('postcss-px2rem')({
              remUnit: env.raw.REACT_APP_REM_UNIT
            })
        ].filter(Boolean),
      sourceMap: shouldUseSourceMap
    }
  };

  const loaders = [
    isProduction ? miniCss : styleLoader,
    cssLoader,
    postCssLoader
  ];

  if (isSass) {
    loaders.push({
      loader: require.resolve('sass-loader'),
      options: {
        sourceMap: shouldUseSourceMap
      }
    });
  } else if (isLess) {
    loaders.push({
      loader: require.resolve('less-loader'),
      options: {
        sourceMap: shouldUseSourceMap
      }
    });
  }

  return {
    test: isModules ? styleModuleRegex : styleRegex,
    exclude: isModules ? '//' : styleModuleRegex,
    use: loaders
  };
}

module.exports.loaders = [
  // "url" loader works just like "file" loader but it also embeds
  // assets smaller than specified size as data URLs to avoid requests.
  {
    test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
    loader: require.resolve('url-loader'),
    options: {
      limit: 10000,
      name: 'static/media/[name].[hash:8].[ext]'
    }
  },
  // Process JS
  {
    test: /\.(js|mjs|jsx)$/,
    include: paths.appSrc,
    loader: require.resolve('babel-loader'),
    options: {
      customize: require.resolve('babel-preset-react-app/webpack-overrides'),
      // @remove-on-eject-begin
      babelrc: false,
      configFile: false,
      presets: [require.resolve('babel-preset-react-app')],
      // Make sure we have a unique cache identifier, erring on the
      // side of caution.
      // We remove this when the user ejects because the default
      // is sane and uses Babel options. Instead of options, we use
      // the react-scripts and babel-preset-react-app versions.
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
  // Process any JS outside of the app with Babel.
  // Unlike the application JS, we only compile the standard ES features.
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
  // Process TypeScript
  {
    test: /\.tsx?$/,
    include: paths.srcPaths,
    exclude: /[\\/]node_modules[\\/]/,
    use: [
      {
        loader: require.resolve('babel-loader'),
        options: {
          plugins: [
            require.resolve('@babel/plugin-syntax-dynamic-import'),
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
          cacheDirectory: true,
          cacheCompression: false
        }
      },
      {
        loader: require.resolve('ts-loader'),
        options: {
          happyPackMode: happyPack,
          getCustomTransformers: require.resolve('./webpack.ts-transformers.js')
        }
      }
    ]
  },
  // Process Css
  getStyleLoader(),
  // Process Less|Sass
  getStyleLoader({ cssType }),
  // Process Css Modules
  getStyleLoader({ modules: true }),
  // Process Less|Sass Modules
  getStyleLoader({ cssType, modules: true }),
  // "file" loader makes sure assets end up in the `build` folder.
  // When you `import` an asset, you get its filename.
  // This loader doesn't use a "test" so it will catch all modules
  // that fall through the other loaders.
  {
    loader: require.resolve('file-loader'),
    // Exclude `js` and `ts` files to keep "css" loader working as it injects
    // it's runtime that would otherwise be processed through "file" loader.
    // Also exclude `html` and `json` extensions so they get processed
    // by webpacks internal loaders.
    exclude: [/\.(js|jsx|mjs)$/, /\.(ts|tsx)$/, /\.html$/, /\.json$/],
    options: {
      name: 'static/media/[name].[hash:8].[ext]'
    }
  }
  // ** STOP ** Are you adding a new loader?
  // Make sure to add the new loader(s) before the "file" loader.
];
