const paths = require('../config/paths');

const eslintConfigPath = paths.ownPath + '/config/.eslintrc';
const eslintIgnorePath = paths.ownPath + '/config/.eslintignore';
const stylelintConfigPath = paths.ownPath + '/config/.stylelintrc';

module.exports = {
  concurrent: false,
  linters: {
    './**/*.{js,jsx}': [
      `eslint --fix --config ${eslintConfigPath} --ignore-path ${eslintIgnorePath}`,
      'git add',
    ],
    './**/*.{html,json,mdx}': ['prettier --write --end-of-line lf', 'git add'],
    './**/*.scss': [
      `stylelint --config ${stylelintConfigPath} --fix`,
      'git add',
    ],
    './**/*.css': [
      `stylelint --config ${stylelintConfigPath} --fix`,
      'git add',
    ],
  },
};
