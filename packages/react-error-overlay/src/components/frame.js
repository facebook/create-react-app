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

function createFrame(
  document: Document,
  frameSetting: FrameSetting,
  frame: StackFrame,
  contextSize: number,
  critical: boolean,
  omits: OmitsObject,
  omitBundle: number,
  parentContainer: HTMLDivElement,
  lastElement: boolean
) {
  const { compiled } = frameSetting;
  const {
    functionName,
    fileName,
    lineNumber,
    columnNumber,
    _scriptCode: scriptLines,
    _originalFileName: sourceFileName,
    _originalLineNumber: sourceLineNumber,
    _originalColumnNumber: sourceColumnNumber,
    _originalScriptCode: sourceLines,
  } = frame;

  let url;
  if (!compiled && sourceFileName && sourceLineNumber) {
    url = sourceFileName + ':' + sourceLineNumber;
    if (sourceColumnNumber) {
      url += ':' + sourceColumnNumber;
    }
  } else if (fileName && lineNumber) {
    url = fileName + ':' + lineNumber;
    if (columnNumber) {
      url += ':' + columnNumber;
    }
  } else {
    url = 'unknown';
  }

  let needsHidden = false;
  const internalUrl = isInternalFile(url, sourceFileName);
  if (internalUrl) {
    ++omits.value;
    needsHidden = true;
  }
  let collapseElement = null;
  if (!internalUrl || lastElement) {
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
      if (lastElement && internalUrl) {
        collapseElement = omittedFrames;
      } else {
        parentContainer.appendChild(omittedFrames);
      }
      ++omits.bundle;
    }
    omits.value = 0;
  }

  const elem = frameDiv(document, functionName, url, internalUrl);
  if (needsHidden) {
    applyStyles(elem, hiddenStyle);
    elem.setAttribute('name', 'bundle-' + omitBundle);
  }

  let hasSource = false;
  if (!internalUrl) {
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
          critical
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
          critical
        )
      );
      hasSource = true;
    }
  }

  return { elem: elem, hasSource: hasSource, collapseElement: collapseElement };
}

export { createFrame };
