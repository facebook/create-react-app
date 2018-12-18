const paths = require('../config/paths');
const { exec } = require('child_process');

const match = paths.appSrc + '/**/*.{js,jsx}';
const prettierCommand = `prettier '${match}'`;

exec(prettierCommand, (error, stdout, stderr) => {
  if (error) {
    console.log('Error: ' + error);
    process.exit(1);
  }
  console.log(stdout);
  console.log(stderr);
  process.exit(0);
});
