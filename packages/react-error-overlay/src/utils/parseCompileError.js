// @flow

export type ErrorLocation = {|
  filePath: string,
  lineNumber: number,
|};

const filePathRegex = /^\.(\/[^\/\n ]+)+\.[^\/\n ]+$/;

// Based on syntax error formating of babylon parser
// https://github.com/babel/babylon/blob/v7.0.0-beta.22/src/parser/location.js#L19
const lineNumberRegex = /^.*\((\d+):(\d+)\)$/;

// Based on error formatting of webpack
// https://github.com/webpack/webpack/blob/v3.5.5/lib/Stats.js#L183-L217
function parseCompileError(message: string): ?ErrorLocation {
  const lines: Array<string> = message.split('\n');
  let filePath: string = '';
  let lineNumber: number = 0;

  for (let i = 0; i < lines.length; i++) {
    const line: string = lines[i];
    if (!line) continue;

    if (!filePath && line.match(filePathRegex)) {
      filePath = line;
    }

    if (!lineNumber) {
      const match: ?Array<string> = line.match(lineNumberRegex);
      if (match) {
        lineNumber = parseInt(match[1]);
      }
    }

    if (filePath && lineNumber) break;
  }

  return filePath && lineNumber ? { filePath, lineNumber } : null;
}

export default parseCompileError;
