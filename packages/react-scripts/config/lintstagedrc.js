const paths = require('../config/paths');

const eslintConfigPath = paths.ownPath + '/config/.eslintrc';
const eslintIgnorePath = paths.ownPath + '/config/.eslintignore';

module.exports = {
  concurrent: false,
  linters: {
    './**/*.{js,jsx}': [
      `eslint --fix --config ${eslintConfigPath} --ignore-path ${eslintIgnorePath}`,
      'git add'
    ],
    './**/*.{html,json,css,scss,mdx}': [
      'prettier --write',
      'git add'
    ],
  },
};
