/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* @flow */
import { ScriptLine } from './stack-frame';

/**
 *
 * @param {number} line The line number to provide context around.
 * @param {number} count The number of lines you'd like for context.
 * @param {string[] | string} lines The source code.
 */
function getLinesAround(
  line: number,
  count: number,
  lines: string[] | string
): ScriptLine[] {
  if (typeof lines === 'string') {
    lines = lines.split('\n');
  }
  const result = [];
  for (
    let index = Math.max(0, line - 1 - count);
    index <= Math.min(lines.length - 1, line - 1 + count);
    ++index
  ) {
    result.push(new ScriptLine(index + 1, lines[index], index === line - 1));
  }
  return result;
}

export { getLinesAround };
export default getLinesAround;
