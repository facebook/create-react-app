const webpack = require('webpack');
const fs = require('fs');
const paths = require('../paths');

const defaultBrowsers = {
  browsers: [
    '>1%',
    'last 4 versions',
    'Firefox ESR',
    'not ie < 9', // React doesn't support IE8 anyway
  ]
};

// Check if there is a browsers.json file and loads it if exists
// this allows us to customize the browsers list without having to eject
function loadBrowsersConfig() {
  return fs.existsSync(paths.browsersFile)
    ? require(paths.browsersFile)
    : defaultBrowsers
}

const postcssBasePlugins = [
  require('postcss-modules-local-by-default'),
  require('postcss-import')({
    addDependencyTo: webpack,
  }),
  require('postcss-cssnext')(loadBrowsersConfig()),
];
const postcssDevPlugins = [];
const postcssProdPlugins = [
  require('cssnano')({
    safe: true,
    sourcemap: true,
    autoprefixer: false,
  }),
];

const postcssPlugins = postcssBasePlugins
  .concat(process.env.NODE_ENV === 'production' ? postcssProdPlugins : [])
  .concat(process.env.NODE_ENV === 'development' ? postcssDevPlugins : []);

module.exports = () => {
  return postcssPlugins;
};
