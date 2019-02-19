/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const os = require('os');
const codeFrame = require('@babel/code-frame').codeFrameColumns;
const chalk = require('chalk');
const fs = require('fs');

function formatter(message, useColors) {
  const hasGetters = typeof message.getFile === 'function';
  const colors = new chalk.constructor({ enabled: useColors });
  const messageColor = message.isWarningSeverity() ? colors.yellow : colors.red;

  let source;

  if (hasGetters) {
    source =
      message.getFile() &&
      fs.existsSync(message.getFile()) &&
      fs.readFileSync(message.getFile(), 'utf-8');
  } else {
    source =
      message.file &&
      fs.existsSync(message.file) &&
      fs.readFileSync(message.file, 'utf-8');
  }

  let frame = '';

  if (source) {
    frame = codeFrame(
      source,
      { start: { line: message.line, column: message.character } },
      { highlightCode: useColors }
    )
      .split('\n')
      .map(str => '  ' + str)
      .join(os.EOL);
  }

  const severity = hasGetters ? message.getSeverity() : message.severity;
  const types = { diagnostic: 'TypeScript', lint: 'TSLint' };

  return [
    messageColor.bold(`${types[message.type]} ${severity.toLowerCase()}: `) +
      (hasGetters ? message.getContent() : message.content) +
      '  ' +
      messageColor.underline(
        (message.type === 'lint' ? 'Rule: ' : 'TS') + message.code
      ),
    '',
    frame,
  ].join(os.EOL);
}

module.exports = formatter;
