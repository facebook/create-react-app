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
  let output = '\n';

  results.forEach(result => {
    let messages = result.messages;
    if (messages.length === 0) {
      return;
    }

    let hasErrors = false;
    messages = messages.map(message => {
      let messageType;
      if (isError(message)) {
        messageType = 'error';
        hasErrors = true;
      } else {
        messageType = 'warn';
      }

      let line = message.line || 0;
      let column = message.column || 0;
      let position = chalk.dim(`${line}:${column}`);
      return [
        '',
        position,
        messageType,
        message.message.replace(/\.$/, ''),
        chalk.dim(message.ruleId || ''),
      ];
    });

    // if there are error messages, we want to show only errors
    if (hasErrors) {
      messages = messages.filter(m => m[2] === 'error');
    }

    // add color to messageTypes
    messages.forEach(m => {
      m[2] = m[2] === 'error' ? chalk.red(m[2]) : chalk.yellow(m[2]);
    });

    let outputTable = table(messages, {
      align: ['l', 'l', 'l'],
      stringLength(str) {
        return chalk.stripColor(str).length;
      },
    });

    output += `${outputTable}\n\n`;
  });

  return output;
}

module.exports = formatter;
