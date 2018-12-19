module.exports = {
  concurrent: false,
  linters: {
    './**/*.{js,jsx}': [
      'eslint --config ./.eslintrc --fix',
      'git add'
    ],
    './**/*.{html,json,css,scss}': [
      'prettier --write',
      'git add'
    ],
  },
};
