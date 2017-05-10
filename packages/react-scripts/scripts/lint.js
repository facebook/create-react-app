'use strict';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// @remove-on-eject-begin
const rootPath = process.cwd();
const CLIEngine = require('eslint').CLIEngine;
const codeFolders = [`${rootPath}/src`, `${rootPath}/test`];

const cli = new CLIEngine({
  envs: ['browser', 'jest', 'es6', 'mocha'],
});
const report = cli.executeOnFiles(codeFolders);

// Output to console
const formatter = cli.getFormatter();
console.log(formatter(report.results));
// @remove-on-eject-end
