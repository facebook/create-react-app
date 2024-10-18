#!/usr/bin/env node

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const execa = require('execa');
const meow = require('meow');
const multimatch = require('multimatch');

//The main entry point for the program, which starts execution based on CLI arguments 
main(meow());

//Main function that controls the execution of the command specified by the user
function main(cli) {
  let count = 0;// Keeps track of the times the pattern has matched

  const start = Date.now();//start time for the process
  const duration = parseInt(cli.flags.timeout, 10) * 1000;//time limit in milliseconds
  const cp = execa(cli.flags.command, { shell: true });

  const target = parseInt(cli.flags.patternCount || '1', 10);

  //listening to standard output (stdout) of the running command.
  cp.stdout.on('data', data => {
    process.stdout.write(data);
    const matches = multimatch([String(data)], cli.flags.pattern);
    const errMatches = multimatch([String(data)], cli.flags.errorPattern);

    if (matches.length > 0) {
      count++;//increment the match count
    }

    if (errMatches.length > 0) {
      process.exit(1);//exits the err if err is found
    }

    //if the target number of matches is reached, exit after a delay.
    if (count >= target) {
      setTimeout(() => {
        process.exit(0);//exits successfully (code 0)
      }, duration);
    }
  });

  //Handles when command exits
  cp.on('exit', e => {
    const elapsed = Date.now() - start;//Calculate the elapsed time since the command started

    //if the process took longer than the timeout, exit immediately
    if (elapsed >= duration) {
      return;
    }

    //Waiting for the remaining duration before exiting with the same exit code
    setTimeout(() => {
      process.exit(e.exitCode);//exit with the code returned by the command
    }, duration - elapsed);
  });
}
