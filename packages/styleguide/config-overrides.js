const { getBabelLoader } = require('react-app-rewired');
module.exports = (config, env) => {
  const babelLoader = getBabelLoader(config.module.rules);

  const docgenPlugin = [
    'babel-plugin-react-docgen',
    {
      DOC_GEN_COLLECTION_NAME: 'MY_REACT_DOCS',
    },
  ];

  babelLoader.options.plugins = [docgenPlugin].concat(
    babelLoader.options.plugins || []
  );

  config.module.rules.map(rule => {
    if (typeof rule.test !== 'undefined' || typeof rule.oneOf === 'undefined') {
      return rule;
    }

    rule.oneOf.unshift({
      test: /\.mdx?$/,
      use: [
        {
          loader: babelLoader.loader,
          options: babelLoader.options,
        },
        '@mdx-js/loader',
      ],
    });

    return rule;
  });

  return config;
};
