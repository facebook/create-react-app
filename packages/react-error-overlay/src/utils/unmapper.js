// @flow
import StackFrame from './stack-frame';
import { getSourceMap } from './getSourceMap';
import { getLinesAround } from './getLinesAround';
import path from 'path';

/**
 * Turns a set of mapped <code>StackFrame</code>s back into their generated code position and enhances them with code.
 * @param {string} fileUri The URI of the <code>bundle.js</code> file.
 * @param {StackFrame[]} frames A set of <code>StackFrame</code>s which are already mapped and missing their generated positions.
 * @param {number} [fileContents=3] The number of lines to provide before and after the line specified in the <code>StackFrame</code>.
 */
async function unmap(
  _fileUri: string | { uri: string, contents: string },
  frames: StackFrame[],
  contextLines: number = 3
): Promise<StackFrame[]> {
  let fileContents = typeof _fileUri === 'object' ? _fileUri.contents : null;
  let fileUri = typeof _fileUri === 'object' ? _fileUri.uri : _fileUri;
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
    if (fileName == null) {
      return frame;
    }
    const fN: string = fileName;
    const splitCache1: any = {}, splitCache2: any = {}, splitCache3: any = {};
    const source = map
      .getSources()
      .map(s => s.replace(/[\\]+/g, '/'))
      .filter(s => {
        s = path.normalize(s);
        return s.indexOf(fN) === s.length - fN.length;
      })
      .sort((a, b) => {
        let a2 = splitCache1[a] || (splitCache1[a] = a.split(path.sep)),
          b2 = splitCache1[b] || (splitCache1[b] = b.split(path.sep));
        return Math.sign(a2.length - b2.length);
      })
      .sort((a, b) => {
        let a2 = splitCache2[a] || (splitCache2[a] = a.split('node_modules')),
          b2 = splitCache2[b] || (splitCache2[b] = b.split('node_modules'));
        return Math.sign(a2.length - b2.length);
      })
      .sort((a, b) => {
        let a2 = splitCache3[a] || (splitCache3[a] = a.split('~')),
          b2 = splitCache3[b] || (splitCache3[b] = b.split('~'));
        return Math.sign(a2.length - b2.length);
      });
    if (source.length < 1 || lineNumber == null) {
      return new StackFrame(
        null,
        null,
        null,
        null,
        null,
        functionName,
        fN,
        lineNumber,
        columnNumber,
        null
      );
    }
    const { line, column } = map.getGeneratedPosition(
      source[0],
      lineNumber,
      // $FlowFixMe
      columnNumber
    );
    const originalSource = map.getSource(source[0]);
    return new StackFrame(
      functionName,
      fileUri,
      line,
      column || null,
      getLinesAround(line, contextLines, fileContents || []),
      functionName,
      fN,
      lineNumber,
      columnNumber,
      getLinesAround(lineNumber, contextLines, originalSource)
    );
  });
}

export { unmap };
export default unmap;
