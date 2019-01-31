const paths = require('../config/paths');
const { exec } = require('child_process');

const prettierMatch = paths.appSrc + '/**/*.{html,js,jsx,json,css,scss,mdx}';
const prettierCommand = `prettier '${prettierMatch}' --write`;
const eslintConfigPath = paths.ownPath + '/config/.eslintrc';
const eslintIgnorePath = paths.ownPath + '/config/.eslintignore';
const eslintCommand = `eslint --fix --config ${eslintConfigPath} --ignore-path ${eslintIgnorePath} --ext .jsx,.js src/`;

exec(prettierCommand, (error, stdout, stderr) => {
  if (error) {
    console.log('Error: ' + error);
    process.exit(1);
  }
  console.log(stdout);
  console.log(stderr);
  process.exit(0);
});

exec(eslintCommand, (error, stdout, stderr) => {
  if (error) {
    console.log('Error: ' + error);
    process.exit(1);
  }
  console.log(stdout);
  console.log(stderr);
  process.exit(0);
});
