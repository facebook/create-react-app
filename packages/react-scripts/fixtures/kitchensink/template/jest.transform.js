const babelOptions = { presets: ['@foreachbe/babel-preset-react-app'] };

module.exports = require('babel-jest').createTransformer(babelOptions);
