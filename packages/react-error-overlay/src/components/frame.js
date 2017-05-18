/* @flow */
import { enableTabClick } from '../utils/dom/enableTabClick';
import { createCode } from './code';
import { isInternalFile } from '../utils/isInternalFile';
import type { StackFrame } from '../utils/stack-frame';
import type { FrameSetting, OmitsObject } from './frames';
import { applyStyles } from '../utils/dom/css';
import {
  omittedFramesExpandedStyle,
  omittedFramesCollapsedStyle,
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
      applyStyles(omittedFrames, omittedFramesCollapsedStyle);
    } else {
      text1.textContent = text1.textContent.replace(/▶/, '▲');
      text1.textContent = text1.textContent.replace(/collapsed/, 'expanded');
      applyStyles(omittedFrames, omittedFramesExpandedStyle);
    }
  });
  applyStyles(omittedFrames, omittedFramesCollapsedStyle);
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
  applyStyles(div, omittedFramesExpandedStyle);
  div.style.display = 'none';

  parent.insertBefore(div, first);
}

function frameDiv(
  document: Document,
  functionName,
  url,
  internalUrl,
  onSourceClick: ?Function
) {
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

  if (typeof onSourceClick === 'function') {
    let handler = onSourceClick;
    enableTabClick(frameAnchor);
    frameAnchor.style.cursor = 'pointer';
    frameAnchor.addEventListener('click', function() {
      handler();
    });
  }

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

function getPrettyURL(
  sourceFileName: ?string,
  sourceLineNumber: ?number,
  sourceColumnNumber: ?number,
  fileName: ?string,
  lineNumber: ?number,
  columnNumber: ?number,
  compiled: boolean
): string {
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
    // Note: we intentionally skip 0's because they're produced by cheap Webpack maps
    if (sourceColumnNumber) {
      prettyURL += ':' + sourceColumnNumber;
    }
  } else if (fileName && typeof lineNumber === 'number') {
    prettyURL = fileName + ':' + lineNumber;
    // Note: we intentionally skip 0's because they're produced by cheap Webpack maps
    if (columnNumber) {
      prettyURL += ':' + columnNumber;
    }
  } else {
    prettyURL = 'unknown';
  }
  return prettyURL;
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

  const prettyURL = getPrettyURL(
    sourceFileName,
    sourceLineNumber,
    sourceColumnNumber,
    fileName,
    lineNumber,
    columnNumber,
    compiled
  );

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

  let onSourceClick = null;
  if (sourceFileName) {
    // e.g. "/path-to-my-app/webpack/bootstrap eaddeb46b67d75e4dfc1"
    const isInternalWebpackBootstrapCode = sourceFileName
      .trim()
      .indexOf(' ') !== -1;
    if (!isInternalWebpackBootstrapCode) {
      onSourceClick = () => {
        fetch(
          '/__open-stack-frame-in-editor?fileName=' +
            window.encodeURIComponent(sourceFileName) +
            '&lineNumber=' +
            window.encodeURIComponent(sourceLineNumber || 1)
        ).then(() => {}, () => {});
      };
    }
  }

  const elem = frameDiv(
    document,
    functionName,
    prettyURL,
    shouldCollapse,
    onSourceClick
  );
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
          onSourceClick
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
          onSourceClick
        )
      );
      hasSource = true;
    }
  }

  return { elem: elem, hasSource: hasSource, collapseElement: collapseElement };
}

export { createFrame };
