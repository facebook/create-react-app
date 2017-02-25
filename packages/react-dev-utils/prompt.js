/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

const rl = require('readline');

// Convention: "no" should be the conservative choice.
// If you mistype the answer, we'll always take it as a "no".
// You can control the behavior on <Enter> with `isYesDefault`.
function prompt(question, isYesDefault) {
  if (typeof isYesDefault !== 'boolean') {
    throw new Error('Provide explicit boolean isYesDefault as second argument.');
  }
  return new Promise(resolve => {
    const rlInterface = rl.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    let hint = isYesDefault === true ? '[Y/n]' : '[y/N]';
    let message = `${question} ${hint}`;

    rlInterface.question(message, function(answer) {
      rlInterface.close();

      let useDefault = answer.trim().length === 0;
      if (useDefault) {
        return resolve(isYesDefault);
      }

      let isYes = answer.match(/^(yes|y)$/i);
      return resolve(isYes);
    });
  });
};

module.exports = prompt;
