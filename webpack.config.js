var autoprefixer = require('autoprefixer');

module.exports = {
  entry: "./index.js",
  output: {
    path: __dirname + '/build',
    filename: "bundle.js"
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: "style-loader!css-loader!postcss-loader" }
    ]
  },
  postcss: function () {
    return [ autoprefixer ];
  }
};
