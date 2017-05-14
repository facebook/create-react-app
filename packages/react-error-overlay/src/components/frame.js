/* @flow */
import { enableTabClick } from '../utils/dom/enableTabClick';
import { createCode } from './code';
import { isInternalFile } from '../utils/isInternalFile';
import type { StackFrame } from '../utils/stack-frame';
import type { FrameSetting, OmitsObject } from './frames';
import { applyStyles } from '../utils/dom/css';
import {
  omittedFramesStyle,
  functionNameStyle,
  depStyle,
  linkStyle,
  anchorStyle,
  hiddenStyle,
} from '../styles';

function getGroupToggle(
  document: Document,
  omitsCount: number,
  omitBundle: number
) {
  const omittedFrames = document.createElement('div');
  enableTabClick(omittedFrames);
  const text1 = document.createTextNode(
    '\u25B6 ' + omitsCount + ' stack frames were collapsed.'
  );
  omittedFrames.appendChild(text1);
  omittedFrames.addEventListener('click', function() {
    const hide = text1.textContent.match(/▲/);
    const list = document.getElementsByName('bundle-' + omitBundle);
    for (let index = 0; index < list.length; ++index) {
      const n = list[index];
      if (hide) {
        n.style.display = 'none';
      } else {
        n.style.display = '';
      }
    }
    if (hide) {
      text1.textContent = text1.textContent.replace(/▲/, '▶');
      text1.textContent = text1.textContent.replace(/expanded/, 'collapsed');
    } else {
      text1.textContent = text1.textContent.replace(/▶/, '▲');
      text1.textContent = text1.textContent.replace(/collapsed/, 'expanded');
    }
  });
  applyStyles(omittedFrames, omittedFramesStyle);
  return omittedFrames;
}

function insertBeforeBundle(
  document: Document,
  parent: Node,
  omitsCount: number,
  omitBundle: number,
  actionElement
) {
  const children = document.getElementsByName('bundle-' + omitBundle);
  if (children.length < 1) {
    return;
  }
  let first: ?Node = children[0];
  while (first != null && first.parentNode !== parent) {
    first = first.parentNode;
  }
  const div = document.createElement('div');
  enableTabClick(div);
  div.setAttribute('name', 'bundle-' + omitBundle);
  const text = document.createTextNode(
    '\u25BC ' + omitsCount + ' stack frames were expanded.'
  );
  div.appendChild(text);
  div.addEventListener('click', function() {
    return actionElement.click();
  });
  applyStyles(div, omittedFramesStyle);
  div.style.display = 'none';

  parent.insertBefore(div, first);
}

function frameDiv(document: Document, functionName, url, internalUrl) {
  const frame = document.createElement('div');
  const frameFunctionName = document.createElement('div');

  let cleanedFunctionName;
  if (!functionName || functionName === 'Object.<anonymous>') {
    cleanedFunctionName = '(anonymous function)';
  } else {
    cleanedFunctionName = functionName;
  }

  const cleanedUrl = url.replace('webpack://', '.');

  if (internalUrl) {
    applyStyles(
      frameFunctionName,
      Object.assign({}, functionNameStyle, depStyle)
    );
  } else {
    applyStyles(frameFunctionName, functionNameStyle);
  }

  frameFunctionName.appendChild(document.createTextNode(cleanedFunctionName));
  frame.appendChild(frameFunctionName);

  const frameLink = document.createElement('div');
  applyStyles(frameLink, linkStyle);
  const frameAnchor = document.createElement('a');
  applyStyles(frameAnchor, anchorStyle);
  frameAnchor.appendChild(document.createTextNode(cleanedUrl));
  frameLink.appendChild(frameAnchor);
  frame.appendChild(frameLink);

  return frame;
}

function isBultinErrorName(errorName: ?string) {
  switch (errorName) {
    case 'EvalError':
    case 'InternalError':
    case 'RangeError':
    case 'ReferenceError':
    case 'SyntaxError':
    case 'TypeError':
    case 'URIError':
      return true;
    default:
      return false;
  }
}

function createFrame(
  document: Document,
  frameSetting: FrameSetting,
  frame: StackFrame,
  contextSize: number,
  critical: boolean,
  omits: OmitsObject,
  omitBundle: number,
  parentContainer: HTMLDivElement,
  lastElement: boolean,
  errorName: ?string
) {
  const { compiled } = frameSetting;
  let { functionName, _originalFileName: sourceFileName } = frame;
  const {
    fileName,
    lineNumber,
    columnNumber,
    _scriptCode: scriptLines,
    _originalLineNumber: sourceLineNumber,
    _originalColumnNumber: sourceColumnNumber,
    _originalScriptCode: sourceLines,
  } = frame;

  // TODO: find a better place for this.
  // Chrome has a bug with inferring function.name:
  // https://github.com/facebookincubator/create-react-app/issues/2097
  // Let's ignore a meaningless name we get for top-level modules.
  if (
    functionName === 'Object.friendlySyntaxErrorLabel' ||
    functionName === 'Object.exports.__esModule'
  ) {
    functionName = '(anonymous function)';
  }

  let prettyURL;
  if (!compiled && sourceFileName && typeof sourceLineNumber === 'number') {
    // Remove everything up to the first /src/ or /node_modules/
    const trimMatch = /^[/|\\].*?[/|\\]((src|node_modules)[/|\\].*)/.exec(
      sourceFileName
    );
    if (trimMatch && trimMatch[1]) {
      prettyURL = trimMatch[1];
    } else {
      prettyURL = sourceFileName;
    }
    prettyURL += ':' + sourceLineNumber;
    if (typeof sourceColumnNumber === 'number') {
      prettyURL += ':' + sourceColumnNumber;
    }
  } else if (fileName && typeof lineNumber === 'number') {
    prettyURL = fileName + ':' + lineNumber;
    if (typeof columnNumber === 'number') {
      prettyURL += ':' + columnNumber;
    }
  } else {
    prettyURL = 'unknown';
  }

  let needsHidden = false;
  const isInternalUrl = isInternalFile(sourceFileName, fileName);
  const isThrownIntentionally = !isBultinErrorName(errorName);
  const shouldCollapse = isInternalUrl &&
    (isThrownIntentionally || omits.hasReachedAppCode);

  if (!isInternalUrl) {
    omits.hasReachedAppCode = true;
  }

  if (shouldCollapse) {
    ++omits.value;
    needsHidden = true;
  }

  let collapseElement = null;
  if (!shouldCollapse || lastElement) {
    if (omits.value > 0) {
      const capV = omits.value;
      const omittedFrames = getGroupToggle(document, capV, omitBundle);
      window.requestAnimationFrame(() => {
        insertBeforeBundle(
          document,
          parentContainer,
          capV,
          omitBundle,
          omittedFrames
        );
      });
      if (lastElement && shouldCollapse) {
        collapseElement = omittedFrames;
      } else {
        parentContainer.appendChild(omittedFrames);
      }
      ++omits.bundle;
    }
    omits.value = 0;
  }

  const elem = frameDiv(document, functionName, prettyURL, shouldCollapse);
  if (needsHidden) {
    applyStyles(elem, hiddenStyle);
    elem.setAttribute('name', 'bundle-' + omitBundle);
  }

  let hasSource = false;
  if (!shouldCollapse) {
    if (
      compiled && scriptLines && scriptLines.length !== 0 && lineNumber != null
    ) {
      elem.appendChild(
        createCode(
          document,
          scriptLines,
          lineNumber,
          columnNumber,
          contextSize,
          critical,
          frame._originalFileName,
          frame._originalLineNumber
        )
      );
      hasSource = true;
    } else if (
      !compiled &&
      sourceLines &&
      sourceLines.length !== 0 &&
      sourceLineNumber != null
    ) {
      elem.appendChild(
        createCode(
          document,
          sourceLines,
          sourceLineNumber,
          sourceColumnNumber,
          contextSize,
          critical,
          frame._originalFileName,
          frame._originalLineNumber
        )
      );
      hasSource = true;
    }
  }

  return { elem: elem, hasSource: hasSource, collapseElement: collapseElement };
}

export { createFrame };
