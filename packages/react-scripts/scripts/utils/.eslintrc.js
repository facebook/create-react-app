const path = require('path')
const paths = require('../../config/paths')

module.exports = {
  'extends': [
    // 'airbnb',
    'prettier',
    'prettier/react',
  ],
  'settings': {
    'import/resolver': {
      'node': {
        'paths': [paths.appPath]
      }
    }
  },
  'env': {
    'browser': true,
    'node': true,
    'jasmine': true
  },
  'parser': 'babel-eslint',
  'plugins': [
    'react',
    'prettier'
  ],
  'rules': {
    'prettier/prettier': [
      'error',
      {
        'printWidth': 120,
        'tabWidth': 2,
        'singleQuote': true,
        'trailingComma': 'es5',
        'bracketSpacing': true,
        'semi': false,
        'useTabs': false,
        'jsxBracketSameLine': false,
        'parser': 'babylon'
      }
    ],
    'import/first': [0],
    'no-underscore-dangle': [0],
    'import/no-named-as-default-member': [0],
    'no-use-before-define': [0],
    'no-shadow': [0],
    'consistent-return': [0],
    'react/prop-types': [0],
    'no-return-assign': [0],
    'react/no-array-index-key': [0],
    'react/prefer-stateless-function': [0],
    'import/prefer-default-export': [0],
    'import/no-named-as-default': [0],
    'global-require': [0],
    'camelcase': [0],
    'react/no-danger': [0],
    'react/no-multi-comp': [0],
    'react/jsx-filename-extension': [
      1,
      {
        'extensions': [
          '.js',
          '.jsx'
        ]
      }
    ],
    'react/forbid-prop-types': [
      0
    ]
  }
}