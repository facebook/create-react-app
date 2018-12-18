module.exports = {
  concurrent: false,
  linters: {
    './**/*.{js,jsx,css,scss}': [
      'eslint --config ./.eslintrc',
      'git add'
    ],
  },
};
