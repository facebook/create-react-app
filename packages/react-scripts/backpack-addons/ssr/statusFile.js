'use strict';

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

function statusFilePath(buildPath) {
  return path.join(buildPath, '.build-status');
}

function done(buildPath) {
  fs.writeFileSync(statusFilePath(buildPath), 'DONE');
}

function inProgress(buildPath) {
  fs.writeFileSync(statusFilePath(buildPath), 'IN_PROGRESS');
}

exports.init = function(compiler, buildPath) {
  mkdirp.sync(buildPath);
  inProgress(buildPath);

  compiler.hooks.invalid.tap('invalid', () => {
    inProgress(buildPath);
  });
  compiler.hooks.done.tap('done', () => {
    done(buildPath);
  });
};

exports.done = done;
