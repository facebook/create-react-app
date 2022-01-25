const babelOptions = { presets: ['react-app'] };

const babelJest = require('babel-jest').default;

module.exports = babelJest.createTransformer(babelOptions);
