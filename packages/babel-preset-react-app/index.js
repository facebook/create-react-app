'use strict';

module.exports = function() {
  var env = process.env.BABEL_ENV || process.env.NODE_ENV;

  return {
    plugins: [
      [
        require.resolve('@babel/plugin-transform-react-jsx'),
        {
          useBuiltIns: true,
        },
      ],
      require.resolve('@babel/plugin-syntax-jsx'), // do we need this
      require.resolve('@babel/plugin-transform-react-display-name'),
      env === 'development' &&
        require.resolve('@babel/plugin-transform-react-jsx-source'),
      env === 'development' &&
        require.resolve('@babel/plugin-transform-react-jsx-self'),
    ].filter(Boolean),
  };
};
