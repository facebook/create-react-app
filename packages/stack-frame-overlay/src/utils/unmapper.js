// @flow
import StackFrame from './stack-frame';
import { getSourceMap } from './getSourceMap';
import { getLinesAround } from './getLinesAround';
import path from 'path';

/**
 * Turns a set of mapped <code>{@link https://github.com/Timer/stack-frame/tree/master/packages/stack-frame#stackframe StackFrame}</code>s back into their generated code position and enhances them with code.
 * @param {string} fileUri The URI of the <code>bundle.js</code> file.
 * @param {StackFrame[]} frames A set of <code>{@link https://github.com/Timer/stack-frame/tree/master/packages/stack-frame#stackframe StackFrame}</code>s which are already mapped and missing their generated positions.
 * @param {number} [fileContents=3] The number of lines to provide before and after the line specified in the <code>{@link https://github.com/Timer/stack-frame/tree/master/packages/stack-frame#stackframe StackFrame}</code>.
 */
async function unmap(
  fileUri: string | { uri: string, contents: string },
  frames: StackFrame[],
  contextLines: number = 3
): Promise<StackFrame[]> {
  let fileContents = typeof fileUri === 'object' ? fileUri.contents : null;
  fileUri = typeof fileUri === 'object' ? fileUri.uri : fileUri;
  if (fileContents == null) {
    fileContents = await fetch(fileUri).then(res => res.text());
  }
  const map = await getSourceMap(fileUri, fileContents);
  return frames.map(frame => {
    const {
      functionName,
      lineNumber,
      columnNumber,
      _originalLineNumber,
    } = frame;
    if (_originalLineNumber != null) {
      return frame;
    }
    let { fileName } = frame;
    if (fileName) {
      fileName = path.normalize(fileName);
    }
    const splitCache1 = {}, splitCache2 = {}, splitCache3 = {};
    const source = map
      .getSources()
      .map(s => s.replace(/[\\]+/g, '/'))
      .filter(s => {
        s = path.normalize(s);
        return s.indexOf(fileName) === s.length - fileName.length;
      })
      .sort((a, b) => {
        a = splitCache1[a] || (splitCache1[a] = a.split(path.sep));
        b = splitCache1[b] || (splitCache1[b] = b.split(path.sep));
        return Math.sign(a.length - b.length);
      })
      .sort((a, b) => {
        a = splitCache2[a] || (splitCache2[a] = a.split('node_modules'));
        b = splitCache2[b] || (splitCache2[b] = b.split('node_modules'));
        return Math.sign(a.length - b.length);
      })
      .sort((a, b) => {
        a = splitCache3[a] || (splitCache3[a] = a.split('~'));
        b = splitCache3[b] || (splitCache3[b] = b.split('~'));
        return Math.sign(a.length - b.length);
      });
    if (source.length < 1) {
      return new StackFrame(
        null,
        null,
        null,
        null,
        null,
        functionName,
        fileName,
        lineNumber,
        columnNumber,
        null
      );
    }
    const { line, column } = map.getGeneratedPosition(
      source[0],
      lineNumber,
      columnNumber
    );
    const originalSource = map.getSource(source[0]);
    return new StackFrame(
      functionName,
      fileUri,
      line,
      column || null,
      getLinesAround(line, contextLines, fileContents),
      functionName,
      fileName,
      lineNumber,
      columnNumber,
      getLinesAround(lineNumber, contextLines, originalSource)
    );
  });
}

export { unmap };
export default unmap;
