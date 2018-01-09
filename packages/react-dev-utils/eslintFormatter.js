/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const chalk = require('chalk');
const table = require('text-table');

function isError(message) {
  if (message.fatal || message.severity === 2) {
    return true;
  }
  return false;
}

function formatter(results) {
  let hasErrors = false;
  let reportContainsErrorRuleIDs = false;

  let output = results.reduce((finalString, result) => {
    let { messages } = result;
    if (messages.length === 0) {
      return;
    }

    const formatedMessages = messages
      .map(message => {
        let messageType;
        if (isError(message)) {
          messageType = 'error';
          hasErrors = true;
          if (message.ruleId) {
            reportContainsErrorRuleIDs = true;
          }
        } else {
          messageType = 'warn';
        }

        let { line = 0 } = message;
        const position = chalk.bold(`Line ${line}:`);

        return [
          '',
          position,
          messageType,
          message.message.replace(/\.$/, ''),
          chalk.underline(message.ruleId || ''),
        ];
      })
      // if there are error messages, we want to show only errors
      .filter(message => (hasErrors && message[2] === 'error') || !hasErrors)
      // add color to rule keywords
      .map(message => {
        message[4] =
          message[2] === 'error'
            ? chalk.red(message[4])
            : chalk.yellow(message[4]);
        return message.splice(2, 1);
      });

    const outputTable = table(formatedMessages, {
      align: ['l', 'l', 'l'],
      stringLength(str) {
        return chalk.stripColor(str).length;
      },
    });

    return finalString.concat(`${outputTable}\n\n`);
  }, '\n');

  if (reportContainsErrorRuleIDs) {
    // Unlike with warnings, we have to do it here.
    // We have similar code in react-scripts for warnings,
    // but warnings can appear in multiple files so we only
    // print it once at the end. For errors, however, we print
    // it here because we always show at most one error, and
    // we can only be sure it's an ESLint error before exiting
    // this function.
    output +=
      'Search for the ' +
      chalk.underline(chalk.red('keywords')) +
      ' to learn more about each error.';
  }

  return output;
}

module.exports = formatter;
