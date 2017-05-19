// @flow
import StackFrame from './stack-frame';
import { getSourceMap } from './getSourceMap';
import { getLinesAround } from './getLinesAround';
import path from 'path';

function count(search: string, string: string): number {
  // Count starts at -1 becuse a do-while loop always runs at least once
  let count = -1, index = -1;
  do {
    // First call or the while case evaluated true, meaning we have to make
    // count 0 or we found a character
    ++count;
    // Find the index of our search string, starting after the previous index
    index = string.indexOf(search, index + 1);
  } while (index !== -1);
  return count;
}

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
    const source = map
      .getSources()
      .map(s => s.replace(/[\\]+/g, '/'))
      .filter(p => {
        p = path.normalize(p);
        const i = p.lastIndexOf(fN);
        return i !== -1 && i === p.length - fN.length;
      })
      .map(p => ({
        token: p,
        seps: count(path.sep, path.normalize(p)),
        penalties: count('node_modules', p) + count('~', p),
      }))
      .sort((a, b) => {
        const s = Math.sign(a.seps - b.seps);
        if (s !== 0) {
          return s;
        }
        return Math.sign(a.penalties - b.penalties);
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
    const sourceT = source[0].token;
    const { line, column } = map.getGeneratedPosition(
      sourceT,
      lineNumber,
      // $FlowFixMe
      columnNumber
    );
    const originalSource = map.getSource(sourceT);
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
