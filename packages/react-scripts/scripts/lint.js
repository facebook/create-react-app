/* eslint-disable */
const paths = require('../config/paths');
const { exec } = require('child_process');

const isCI = process.env.CI === 'true';

const eslintConfigPath = paths.ownPath + '/config/.eslintrc';
const eslintIgnorePath = paths.ownPath + '/config/.eslintignore';

const prettierMatch = paths.appSrc + '/**/*.{html,json,mdx}';
const prettierCommand = `prettier '${prettierMatch}' --ignore-path ${eslintIgnorePath} ${
  isCI ? '--check' : '--write'
} --end-of-line lf`;

const eslintCommand = `eslint ${
  isCI ? '' : '--fix'
} --config ${eslintConfigPath} --ignore-path ${eslintIgnorePath} --ext .jsx,.js src/`;

const stylelintMatchSass = paths.appSrc + '/**/*.scss';
const stylelintMatchCss = paths.appSrc + '/**/*.css';
const stylelintConfigPath = paths.ownPath + '/config/.stylelintrc';
const stylelintCommandSass = `stylelint "${stylelintMatchSass}" ${
  isCI ? '' : '--fix'
} --config ${stylelintConfigPath}`;
const stylelintCommandCss = `stylelint "${stylelintMatchCss}" ${
  isCI ? '' : '--fix'
} --config ${stylelintConfigPath}`;

exec(prettierCommand, (error, stdout, stderr) => {
  if (error) {
    console.log(stdout);
    console.log(stderr);
    console.log('Error: ' + error);
    process.exit(1);
  }
  console.log(stdout);
});

exec(stylelintCommandSass, (error, stdout, stderr) => {
  if (error) {
    console.log(stdout);
    console.log(stderr);
    console.log('Error: ' + error);
    process.exit(1);
  }
  console.log('All .scss files were formatted correclty ' + stdout);
});

exec(stylelintCommandCss, (error, stdout, stderr) => {
  if (error) {
    console.log(stdout);
    console.log(stderr);
    console.log('Error: ' + error);
    process.exit(1);
  }
  console.log('All .css files were formatted correclty ' + stdout);
});

exec(eslintCommand, (error, stdout, stderr) => {
  if (error) {
    console.log(stdout);
    console.log(stderr);
    console.log('Error: ' + error);
    process.exit(1);
  }
  console.log('All .js and .jsx files were formatted correclty ' + stdout);
  process.exit(0);
});
