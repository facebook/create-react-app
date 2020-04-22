const babelOptions = { presets: ['react-app'] };

module.exports = require('babel-jest').createTransformer(babelOptions);
