// @flow
import Anser from 'anser';

export type ErrorLocation = {|
  filePath: string,
  lineNumber: number,
|};

const filePathRegex = /^\.(\/[^\/\n ]+)+\.[^\/\n ]+$/;

const lineNumberRegexes = [
  // Babel syntax errors
  // Based on syntax error formating of babylon parser
  // https://github.com/babel/babylon/blob/v7.0.0-beta.22/src/parser/location.js#L19
  /^.*\((\d+):(\d+)\)$/,

  // ESLint errors
  // Based on eslintFormatter in react-dev-utils
  /^Line (\d+):.+$/,
];

// Based on error formatting of webpack
// https://github.com/webpack/webpack/blob/v3.5.5/lib/Stats.js#L183-L217
function parseCompileError(message: string): ?ErrorLocation {
  const lines: Array<string> = message.split('\n');
  let filePath: string = '';
  let lineNumber: number = 0;

  for (let i = 0; i < lines.length; i++) {
    const line: string = Anser.ansiToText(lines[i]).trim();
    if (!line) continue;

    if (!filePath && line.match(filePathRegex)) {
      filePath = line;
    }

    let k = 0;
    while (k < lineNumberRegexes.length) {
      const match: ?Array<string> = line.match(lineNumberRegexes[k]);
      if (match) {
        lineNumber = parseInt(match[1]);
        break;
      }
      k++;
    }

    if (filePath && lineNumber) break;
  }

  return filePath && lineNumber ? { filePath, lineNumber } : null;
}

export default parseCompileError;
