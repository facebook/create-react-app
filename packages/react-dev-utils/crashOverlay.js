/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
}

var stackFrameParser = require('stack-frame-parser');
var stackFrameMapper = require('stack-frame-mapper');
var stackFrameUnmapper = require('stack-frame-unmapper');
var codeFrame = _interopDefault(require('babel-code-frame'));
var ansiHTML = require('./ansiHTML');

var boundErrorHandler = null;

function errorHandler(callback, e) {
  if (!e.error) {
    return;
  }
  // $FlowFixMe
  var error = e.error;

  if (error instanceof Error) {
    callback(error);
  } else {
    // A non-error was thrown, we don't have a trace. :(
    // Look in your browser's devtools for more information
    callback(new Error(error));
  }
}

function registerUnhandledError(target, callback) {
  if (boundErrorHandler !== null) {
    return;
  }
  boundErrorHandler = errorHandler.bind(undefined, callback);
  target.addEventListener('error', boundErrorHandler);
}

function unregisterUnhandledError(target) {
  if (boundErrorHandler === null) {
    return;
  }
  target.removeEventListener('error', boundErrorHandler);
  boundErrorHandler = null;
}

var boundRejectionHandler = null;

function rejectionHandler(callback, e) {
  if (e == null || e.reason == null) {
    return callback(new Error('Unknown'));
  }
  var reason = e.reason;

  if (reason instanceof Error) {
    return callback(reason);
  }
  // A non-error was rejected, we don't have a trace :(
  // Look in your browser's devtools for more information
  return callback(new Error(reason));
}

function registerUnhandledRejection(target, callback) {
  if (boundRejectionHandler !== null) {
    return;
  }
  boundRejectionHandler = rejectionHandler.bind(undefined, callback);
  // $FlowFixMe
  target.addEventListener('unhandledrejection', boundRejectionHandler);
}

function unregisterUnhandledRejection(target) {
  if (boundRejectionHandler === null) {
    return;
  }
  // $FlowFixMe
  target.removeEventListener('unhandledrejection', boundRejectionHandler);
  boundRejectionHandler = null;
}

var SHORTCUT_ESCAPE = 'SHORTCUT_ESCAPE';
var SHORTCUT_LEFT = 'SHORTCUT_LEFT';
var SHORTCUT_RIGHT = 'SHORTCUT_RIGHT';

var boundKeyHandler = null;

function keyHandler(callback, e) {
  var key = e.key, keyCode = e.keyCode, which = e.which;

  if (key === 'Escape' || keyCode === 27 || which === 27) {
    callback(SHORTCUT_ESCAPE);
  } else if (key === 'ArrowLeft' || keyCode === 37 || which === 37) {
    callback(SHORTCUT_LEFT);
  } else if (key === 'ArrowRight' || keyCode === 39 || which === 39) {
    callback(SHORTCUT_RIGHT);
  }
}

function registerShortcuts(target, callback) {
  if (boundKeyHandler !== null) {
    return;
  }
  boundKeyHandler = keyHandler.bind(undefined, callback);
  target.addEventListener('keydown', boundKeyHandler);
}

function unregisterShortcuts(target) {
  if (boundKeyHandler === null) {
    return;
  }
  target.removeEventListener('keydown', boundKeyHandler);
  boundKeyHandler = null;
}

var stackTraceRegistered = false;
// Default: https://docs.microsoft.com/en-us/scripting/javascript/reference/stacktracelimit-property-error-javascript
var restoreStackTraceValue = 10;

var MAX_STACK_LENGTH = 50;

function registerStackTraceLimit() {
  var limit = arguments.length > 0 && arguments[0] !== undefined
    ? arguments[0]
    : MAX_STACK_LENGTH;

  if (stackTraceRegistered) {
    return;
  }
  try {
    restoreStackTraceValue = Error.stackTraceLimit;
    Error.stackTraceLimit = limit;
    stackTraceRegistered = true;
  } catch (e) {
    // Not all browsers support this so we don't care if it errors
  }
}

function unregisterStackTraceLimit() {
  if (!stackTraceRegistered) {
    return;
  }
  try {
    Error.stackTraceLimit = restoreStackTraceValue;
    stackTraceRegistered = false;
  } catch (e) {
    // Not all browsers support this so we don't care if it errors
  }
}

var recorded = [];

var errorsConsumed = 0;

function consume(error) {
  var unhandledRejection = arguments.length > 1 && arguments[1] !== undefined
    ? arguments[1]
    : false;
  var contextSize = arguments.length > 2 && arguments[2] !== undefined
    ? arguments[2]
    : 3;

  var parsedFrames = stackFrameParser.parse(error);
  var enhancedFramesPromise = void 0;
  if (error.__unmap_source) {
    enhancedFramesPromise = stackFrameUnmapper.unmap(
      error.__unmap_source,
      parsedFrames,
      contextSize
    );
  } else {
    enhancedFramesPromise = stackFrameMapper.map(parsedFrames, contextSize);
  }
  return enhancedFramesPromise.then(function(enhancedFrames) {
    enhancedFrames = enhancedFrames.filter(function(_ref) {
      var functionName = _ref.functionName;
      return functionName == null ||
        functionName.indexOf('__stack_frame_overlay_proxy_console__') === -1;
    });
    recorded[++errorsConsumed] = {
      error: error,
      unhandledRejection: unhandledRejection,
      contextSize: contextSize,
      enhancedFrames: enhancedFrames,
    };
    return errorsConsumed;
  });
}

function getErrorRecord(ref) {
  return recorded[ref];
}

function drain() {
  // $FlowFixMe
  var keys = Object.keys(recorded);
  for (var index = 0; index < keys.length; ++index) {
    delete recorded[keys[index]];
  }
}

var black = '#293238';
var darkGray = '#878e91';
var lightGray = '#fafafa';
var red = '#ce1126';
var lightRed = '#fccfcf';
var yellow = '#fbf5b4';

var iframeStyle = {
  'background-color': lightGray,
  position: 'fixed',
  top: '1em',
  left: '1em',
  bottom: '1em',
  right: '1em',
  width: 'calc(100% - 2em)',
  height: 'calc(100% - 2em)',
  'border-radius': '3px',
  'box-shadow': '0 0 6px 0 rgba(0, 0, 0, 0.5)',
  'z-index': 1337,
};

var overlayStyle = {
  'box-sizing': 'border-box',
  padding: '4rem',
  'font-family': 'Consolas, Menlo, monospace',
  color: black,
  'white-space': 'pre-wrap',
  overflow: 'auto',
  'overflow-x': 'hidden',
  'word-break': 'break-word',
  'line-height': 1.5,
};

var hintsStyle = {
  'font-size': '0.8em',
  'margin-top': '-3em',
  'margin-bottom': '3em',
  'text-align': 'right',
  color: darkGray,
};

var hintStyle = {
  padding: '0.5em 1em',
  cursor: 'pointer',
};

var closeButtonStyle = {
  'font-size': '26px',
  color: black,
  padding: '0.5em 1em',
  cursor: 'pointer',
  position: 'absolute',
  right: 0,
  top: 0,
};

var additionalStyle = {
  'margin-bottom': '1.5em',
  'margin-top': '-4em',
};

var headerStyle = {
  'font-size': '1.7em',
  'font-weight': 'bold',
  color: red,
};

var functionNameStyle = {
  'margin-top': '1em',
  'font-size': '1.2em',
};

var linkStyle = {
  'font-size': '0.9em',
};

var anchorStyle = {
  'text-decoration': 'none',
  color: darkGray,
};

var traceStyle = {
  'font-size': '1em',
};

var depStyle = {
  'font-size': '1.2em',
};

var primaryErrorStyle = {
  'background-color': lightRed,
};

var secondaryErrorStyle = {
  'background-color': yellow,
};

var omittedFramesStyle = {
  color: black,
  'font-size': '0.9em',
  margin: '1.5em 0',
  cursor: 'pointer',
};

var preStyle = {
  display: 'block',
  padding: '0.5em',
  'margin-top': '1.5em',
  'margin-bottom': '0px',
  'overflow-x': 'auto',
  'font-size': '1.1em',
  'white-space': 'pre',
};

var toggleStyle = {
  'margin-bottom': '1.5em',
  color: darkGray,
  cursor: 'pointer',
};

var codeStyle = {
  'font-family': 'Consolas, Menlo, monospace',
};

var hiddenStyle = {
  display: 'none',
};

var groupStyle = {
  'margin-left': '1em',
};

var _groupElemStyle = {
  'background-color': 'inherit',
  'border-color': '#ddd',
  'border-width': '1px',
  'border-radius': '4px',
  'border-style': 'solid',
  padding: '3px 6px',
  cursor: 'pointer',
};

var groupElemLeft = Object.assign({}, _groupElemStyle, {
  'border-top-right-radius': '0px',
  'border-bottom-right-radius': '0px',
  'margin-right': '0px',
});

var groupElemRight = Object.assign({}, _groupElemStyle, {
  'border-top-left-radius': '0px',
  'border-bottom-left-radius': '0px',
  'margin-left': '-1px',
});

var footerStyle = {
  'text-align': 'center',
  color: darkGray,
};

var injectedCount = 0;
var injectedCache = {};

function getHead(document) {
  return document.head || document.getElementsByTagName('head')[0];
}

function injectCss(document, css) {
  var head = getHead(document);
  var style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));
  head.appendChild(style);

  injectedCache[++injectedCount] = style;
  return injectedCount;
}

function applyStyles(element, styles) {
  element.setAttribute('style', '');
  for (var key in styles) {
    if (!styles.hasOwnProperty(key)) {
      continue;
    }
    // $FlowFixMe
    element.style[key] = styles[key];
  }
}

function createHint(document, hint) {
  var span = document.createElement('span');
  span.appendChild(document.createTextNode(hint));
  applyStyles(span, hintStyle);
  return span;
}

function createClose(document, callback) {
  var hints = document.createElement('div');
  applyStyles(hints, hintsStyle);

  var close = createHint(document, '×');
  close.addEventListener('click', function() {
    return callback();
  });
  applyStyles(close, closeButtonStyle);
  hints.appendChild(close);
  return hints;
}

function enableTabClick(node) {
  node.setAttribute('tabindex', '0');
  node.addEventListener('keydown', function(e) {
    var key = e.key, which = e.which, keyCode = e.keyCode;

    if (key === 'Enter' || which === 13 || keyCode === 13) {
      e.preventDefault();
      if (typeof e.target.click === 'function') {
        e.target.click();
      }
    }
  });
}

function removeNextBr(parent, component) {
  while (component != null && component.tagName.toLowerCase() !== 'br') {
    component = component.nextElementSibling;
  }
  if (component != null) {
    parent.removeChild(component);
  }
}

function absolutifyCaret(component) {
  var ccn = component.childNodes;
  for (var index = 0; index < ccn.length; ++index) {
    var c = ccn[index];
    // $FlowFixMe
    if (c.tagName.toLowerCase() !== 'span') {
      continue;
    }
    var _text = c.innerText;
    if (_text == null) {
      continue;
    }
    var text = _text.replace(/\s/g, '');
    if (text !== '|^') {
      continue;
    }
    // $FlowFixMe
    c.style.position = 'absolute';
    // $FlowFixMe
    removeNextBr(component, c);
  }
}

function createCode(document, sourceLines, lineNum, columnNum, contextSize) {
  var main = arguments.length > 5 && arguments[5] !== undefined
    ? arguments[5]
    : false;

  var sourceCode = [];
  var whiteSpace = Infinity;
  sourceLines.forEach(function(e) {
    var text = e.content;

    var m = text.match(/^\s*/);
    if (text === '') {
      return;
    }
    if (m && m[0]) {
      whiteSpace = Math.min(whiteSpace, m[0].length);
    } else {
      whiteSpace = 0;
    }
  });
  sourceLines.forEach(function(e) {
    var text = e.content;
    var line = e.lineNumber;

    if (isFinite(whiteSpace)) {
      text = text.substring(whiteSpace);
    }
    sourceCode[line - 1] = text;
  });
  var ansiHighlight = codeFrame(
    sourceCode.join('\n'),
    lineNum,
    columnNum - (isFinite(whiteSpace) ? whiteSpace : 0),
    {
      forceColor: true,
      linesAbove: contextSize,
      linesBelow: contextSize,
    }
  );
  var htmlHighlight = ansiHTML(ansiHighlight);
  var code = document.createElement('code');
  code.innerHTML = htmlHighlight;
  absolutifyCaret(code);
  applyStyles(code, codeStyle);

  var ccn = code.childNodes;
  oLoop: for (var index = 0; index < ccn.length; ++index) {
    var node = ccn[index];
    var ccn2 = node.childNodes;
    for (var index2 = 0; index2 < ccn2.length; ++index2) {
      var lineNode = ccn2[index2];
      var text = lineNode.innerText;
      if (text == null) {
        continue;
      }
      if (text.indexOf(' ' + lineNum + ' |') === -1) {
        continue;
      }
      // $FlowFixMe
      applyStyles(node, main ? primaryErrorStyle : secondaryErrorStyle);
      break oLoop;
    }
  }
  var pre = document.createElement('pre');
  applyStyles(pre, preStyle);
  pre.appendChild(code);
  return pre;
}

function isInternalFile(url, sourceFileName) {
  return url.indexOf('/~/') !== -1 ||
    url.indexOf('/node_modules/') !== -1 ||
    url.trim().indexOf(' ') !== -1 ||
    sourceFileName == null ||
    sourceFileName.length === 0;
}

function getGroupToggle(document, omitsCount, omitBundle) {
  var omittedFrames = document.createElement('div');
  enableTabClick(omittedFrames);
  var text1 = document.createTextNode(
    '\u25B6 ' + omitsCount + ' stack frames were collapsed.'
  );
  omittedFrames.appendChild(text1);
  omittedFrames.addEventListener('click', function() {
    var hide = text1.textContent.match(/▲/);
    var list = document.getElementsByName('bundle-' + omitBundle);
    for (var index = 0; index < list.length; ++index) {
      var n = list[index];
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
  document,
  parent,
  omitsCount,
  omitBundle,
  actionElement
) {
  var children = document.getElementsByName('bundle-' + omitBundle);
  if (children.length < 1) {
    return;
  }
  var first = children[0];
  while (first != null && first.parentNode !== parent) {
    first = first.parentNode;
  }
  var div = document.createElement('div');
  enableTabClick(div);
  div.setAttribute('name', 'bundle-' + omitBundle);
  var text = document.createTextNode(
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

function frameDiv(document, functionName, url, internalUrl) {
  var frame = document.createElement('div');
  var frameFunctionName = document.createElement('div');

  var cleanedFunctionName = void 0;
  if (!functionName || functionName === 'Object.<anonymous>') {
    cleanedFunctionName = '(anonymous function)';
  } else {
    cleanedFunctionName = functionName;
  }

  var cleanedUrl = url.replace('webpack://', '.');

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

  var frameLink = document.createElement('div');
  applyStyles(frameLink, linkStyle);
  var frameAnchor = document.createElement('a');
  applyStyles(frameAnchor, anchorStyle);
  //frameAnchor.href = url
  frameAnchor.appendChild(document.createTextNode(cleanedUrl));
  frameLink.appendChild(frameAnchor);
  frame.appendChild(frameLink);

  return frame;
}

function createFrame(
  document,
  frameSetting,
  frame,
  contextSize,
  critical,
  omits,
  omitBundle,
  parentContainer,
  lastElement
) {
  var compiled = frameSetting.compiled;
  var functionName = frame.functionName,
    fileName = frame.fileName,
    lineNumber = frame.lineNumber,
    columnNumber = frame.columnNumber,
    scriptLines = frame._scriptCode,
    sourceFileName = frame._originalFileName,
    sourceLineNumber = frame._originalLineNumber,
    sourceColumnNumber = frame._originalColumnNumber,
    sourceLines = frame._originalScriptCode;

  var url = void 0;
  if (!compiled && sourceFileName) {
    url = sourceFileName + ':' + sourceLineNumber;
    if (sourceColumnNumber) {
      url += ':' + sourceColumnNumber;
    }
  } else {
    url = fileName + ':' + lineNumber;
    if (columnNumber) {
      url += ':' + columnNumber;
    }
  }

  var needsHidden = false;
  var internalUrl = isInternalFile(url, sourceFileName);
  if (internalUrl) {
    ++omits.value;
    needsHidden = true;
  }
  var collapseElement = null;
  if (!internalUrl || lastElement) {
    if (omits.value > 0) {
      var capV = omits.value;
      var omittedFrames = getGroupToggle(document, capV, omitBundle);
      window.requestAnimationFrame(function() {
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

  var elem = frameDiv(document, functionName, url, internalUrl);
  if (needsHidden) {
    applyStyles(elem, hiddenStyle);
    elem.setAttribute('name', 'bundle-' + omitBundle);
  }

  var hasSource = false;
  if (!internalUrl) {
    if (compiled && scriptLines.length !== 0) {
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
    } else if (!compiled && sourceLines.length !== 0) {
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

function createFrameWrapper(
  document,
  parent,
  factory,
  lIndex,
  frameSettings,
  contextSize
) {
  var fac = factory();
  if (fac == null) {
    return;
  }
  var hasSource = fac.hasSource,
    elem = fac.elem,
    collapseElement = fac.collapseElement;

  var elemWrapper = document.createElement('div');
  elemWrapper.appendChild(elem);

  if (hasSource) {
    var compiledDiv = document.createElement('div');
    enableTabClick(compiledDiv);
    applyStyles(compiledDiv, toggleStyle);

    var o = frameSettings[lIndex];
    var compiledText = document.createTextNode(
      'View ' + (o && o.compiled ? 'source' : 'compiled')
    );
    compiledDiv.addEventListener('click', function() {
      if (o) {
        o.compiled = !o.compiled;
      }

      var next = createFrameWrapper(
        document,
        parent,
        factory,
        lIndex,
        frameSettings,
        contextSize
      );
      if (next != null) {
        parent.insertBefore(next, elemWrapper);
        parent.removeChild(elemWrapper);
      }
    });
    compiledDiv.appendChild(compiledText);
    elemWrapper.appendChild(compiledDiv);
  }

  if (collapseElement != null) {
    elemWrapper.appendChild(collapseElement);
  }

  return elemWrapper;
}

function createFrames(document, resolvedFrames, frameSettings, contextSize) {
  if (resolvedFrames.length !== frameSettings.length) {
    throw new Error(
      'You must give a frame settings array of identical length to resolved frames.'
    );
  }
  var trace = document.createElement('div');
  applyStyles(trace, traceStyle);

  var index = 0;
  var critical = true;
  var omits = { value: 0, bundle: 1 };
  resolvedFrames.forEach(function(frame) {
    var lIndex = index++;
    var elem = createFrameWrapper(
      document,
      trace,
      createFrame.bind(
        undefined,
        document,
        frameSettings[lIndex],
        frame,
        contextSize,
        critical,
        omits,
        omits.bundle,
        trace,
        index === resolvedFrames.length
      ),
      lIndex,
      frameSettings,
      contextSize
    );
    if (elem == null) {
      return;
    }
    critical = false;
    trace.appendChild(elem);
  });
  //TODO: fix this
  omits.value = 0;

  return trace;
}

function createFooter(document) {
  var div = document.createElement('div');
  applyStyles(div, footerStyle);
  div.appendChild(
    document.createTextNode(
      'This screen is visible only in development. It will not appear when the app crashes in production.'
    )
  );
  div.appendChild(document.createElement('br'));
  div.appendChild(
    document.createTextNode(
      'Open your browser’s developer console to further inspect this error.'
    )
  );
  return div;
}

function consumeEvent(e) {
  e.preventDefault();
  if (typeof e.target.blur === 'function') {
    e.target.blur();
  }
}

function updateAdditional(
  document,
  additionalReference,
  currentError,
  totalErrors,
  switchCallback
) {
  if (additionalReference.lastChild) {
    additionalReference.removeChild(additionalReference.lastChild);
  }

  var text = ' ';
  if (totalErrors <= 1) {
    additionalReference.appendChild(document.createTextNode(text));
    return;
  }
  text = 'Errors ' + currentError + ' of ' + totalErrors;
  var span = document.createElement('span');
  span.appendChild(document.createTextNode(text));
  var group = document.createElement('span');
  applyStyles(group, groupStyle);
  var left = document.createElement('button');
  applyStyles(left, groupElemLeft);
  left.addEventListener('click', function(e) {
    consumeEvent(e);
    switchCallback(-1);
  });
  left.appendChild(document.createTextNode('←'));
  enableTabClick(left);
  var right = document.createElement('button');
  applyStyles(right, groupElemRight);
  right.addEventListener('click', function(e) {
    consumeEvent(e);
    switchCallback(1);
  });
  right.appendChild(document.createTextNode('→'));
  enableTabClick(right);
  group.appendChild(left);
  group.appendChild(right);
  span.appendChild(group);
  additionalReference.appendChild(span);
}

function createOverlay(
  document,
  name,
  message,
  frames,
  contextSize,
  currentError,
  totalErrors,
  switchCallback,
  closeCallback
) {
  var frameSettings = frames.map(function() {
    return { compiled: false };
  });
  // Create overlay
  var overlay = document.createElement('div');
  applyStyles(overlay, overlayStyle);
  overlay.appendChild(createClose(document, closeCallback));

  // Create container
  var container = document.createElement('div');
  container.className = 'cra-container';
  overlay.appendChild(container);

  // Create additional
  var additional = document.createElement('div');
  applyStyles(additional, additionalStyle);
  container.appendChild(additional);
  updateAdditional(
    document,
    additional,
    currentError,
    totalErrors,
    switchCallback
  );

  // Create header
  var header = document.createElement('div');
  applyStyles(header, headerStyle);
  if (message.match(/^\w*:/)) {
    header.appendChild(document.createTextNode(message));
  } else {
    header.appendChild(document.createTextNode(name + ': ' + message));
  }
  container.appendChild(header);

  // Create trace
  container.appendChild(
    createFrames(document, frames, frameSettings, contextSize)
  );

  // Show message
  container.appendChild(createFooter(document));

  return {
    overlay: overlay,
    additional: additional,
  };
}

var CONTEXT_SIZE = 3;
var iframeReference = null;
var additionalReference = null;
var errorReferences = [];
var currReferenceIndex = -1;

var css = [
  '.cra-container {',
  '  padding-right: 15px;',
  '  padding-left: 15px;',
  '  margin-right: auto;',
  '  margin-left: auto;',
  '}',
  '',
  '@media (min-width: 768px) {',
  '  .cra-container {',
  '    width: calc(750px - 6em);',
  '  }',
  '}',
  '',
  '@media (min-width: 992px) {',
  '  .cra-container {',
  '    width: calc(970px - 6em);',
  '  }',
  '}',
  '',
  '@media (min-width: 1200px) {',
  '  .cra-container {',
  '    width: calc(1170px - 6em);',
  '  }',
  '}',
].join('\n');

function render(name, message, resolvedFrames) {
  disposeCurrentView();

  var iframe = window.document.createElement('iframe');
  applyStyles(iframe, iframeStyle);
  iframeReference = iframe;
  iframe.onload = function() {
    if (iframeReference == null) {
      return;
    }
    var w = iframeReference.contentWindow;
    var document = iframeReference.contentDocument;

    var _createOverlay = createOverlay(
      document,
      name,
      message,
      resolvedFrames,
      CONTEXT_SIZE,
      currReferenceIndex + 1,
      errorReferences.length,
      function(offset) {
        switchError(offset);
      },
      function() {
        unmount();
      }
    ),
      overlay = _createOverlay.overlay,
      additional = _createOverlay.additional;

    if (w != null) {
      w.onkeydown = function(event) {
        keyHandler(
          function(type) {
            return shortcutHandler(type);
          },
          event
        );
      };
    }
    injectCss(iframeReference.contentDocument, css);
    if (document.body != null) {
      document.body.appendChild(overlay);
    }
    additionalReference = additional;
  };
  window.document.body.appendChild(iframe);
}

function renderErrorByIndex(index) {
  currReferenceIndex = index;

  var _getErrorRecord = getErrorRecord(errorReferences[index]),
    error = _getErrorRecord.error,
    unhandledRejection = _getErrorRecord.unhandledRejection,
    enhancedFrames = _getErrorRecord.enhancedFrames;

  if (unhandledRejection) {
    render(
      'Unhandled Rejection (' + error.name + ')',
      error.message,
      enhancedFrames
    );
  } else {
    render(error.name, error.message, enhancedFrames);
  }
}

function switchError(offset) {
  var nextView = currReferenceIndex + offset;
  if (nextView < 0 || nextView >= errorReferences.length) {
    return;
  }
  renderErrorByIndex(nextView);
}

function disposeCurrentView() {
  if (iframeReference === null) {
    return;
  }
  window.document.body.removeChild(iframeReference);
  iframeReference = null;
  additionalReference = null;
}

function unmount() {
  disposeCurrentView();
  drain();
  errorReferences = [];
  currReferenceIndex = -1;
}

function crash(error) {
  var unhandledRejection = arguments.length > 1 && arguments[1] !== undefined
    ? arguments[1]
    : false;

  if (module.hot && typeof module.hot.decline === 'function') {
    module.hot.decline();
  }
  consume(error, unhandledRejection, CONTEXT_SIZE)
    .then(function(ref) {
      errorReferences.push(ref);
      if (iframeReference !== null && additionalReference !== null) {
        updateAdditional(
          iframeReference.contentDocument,
          additionalReference,
          currReferenceIndex + 1,
          errorReferences.length,
          function(offset) {
            switchError(offset);
          }
        );
      } else {
        if (errorReferences.length !== 1) {
          throw new Error('Something is *really* wrong.');
        }
        renderErrorByIndex((currReferenceIndex = 0));
      }
    })
    .catch(function(e) {
      console.log('Could not consume error:', e);
    });
}

function shortcutHandler(type) {
  switch (type) {
    case SHORTCUT_ESCAPE: {
      unmount();
      break;
    }
    case SHORTCUT_LEFT: {
      switchError(-1);
      break;
    }
    case SHORTCUT_RIGHT: {
      switchError(1);
      break;
    }
  }
}

function inject() {
  registerUnhandledError(window, function(error) {
    return crash(error);
  });
  registerUnhandledRejection(window, function(error) {
    return crash(error, true);
  });
  registerShortcuts(window, shortcutHandler);
  registerStackTraceLimit();
}

function uninject() {
  unregisterStackTraceLimit();
  unregisterShortcuts(window);
  unregisterUnhandledRejection(window);
  unregisterUnhandledError(window);
}

inject();
if (module.hot && typeof module.hot.dispose === 'function') {
  module.hot.dispose(function() {
    uninject();
  });
}
