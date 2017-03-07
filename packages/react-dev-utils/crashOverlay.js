/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var codeFrame = require('babel-code-frame');
var ansiHTML = require('./ansiHTML');
var StackTraceResolve = require('stack-frame-resolver').default;

var CONTEXT_SIZE = 3;

var black = '#293238';
var darkGray = '#878e91';
var lightGray = '#fafafa';
var red = '#ce1126';
var lightRed = '#fccfcf';
var yellow = '#fbf5b4';

function getHead() {
  return document.head || document.getElementsByTagName('head')[0];
}

var injectedCss = [];

// From: http://stackoverflow.com/a/524721/127629
function injectCss(css) {
  var head = getHead();
  var style = document.createElement('style');

  style.type = 'text/css';
  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }

  head.appendChild(style);
  injectedCss.push(style);
}

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
  '}'
].join('\n');

var overlayStyle = {
  position: 'fixed',
  'box-sizing': 'border-box',
  top: '1em', left: '1em',
  bottom: '1em', right: '1em',
  width: 'calc(100% - 2em)', height: 'calc(100% - 2em)',
  'border-radius': '3px',
  'background-color': lightGray,
  padding: '4rem',
  'z-index': 1337,
  'font-family': 'Consolas, Menlo, monospace',
  color: black,
  'white-space': 'pre-wrap',
  overflow: 'auto',
  'overflow-x': 'hidden',
  'word-break': 'break-all',
  'box-shadow': '0 0 6px 0 rgba(0, 0, 0, 0.5)',
  'line-height': 1.5
};

var hintsStyle = {
  'font-size': '0.8em',
  'margin-top': '-3em',
  'margin-bottom': '3em',
  'text-align': 'right',
  color: darkGray
};

var hintStyle = {
  padding: '0.5em 1em',
  cursor: 'pointer'
};

var closeButtonStyle = {
  'font-size': '26px',
  color: black,
  padding: '0.5em 1em',
  cursor: 'pointer',
  position: 'absolute',
  right: 0,
  top: 0
};

var additionalStyle = {
  'margin-bottom': '1.5em',
  'margin-top': '-4em'
};

var headerStyle = {
  'font-size': '1.7em',
  'font-weight': 'bold',
  color: red
};

var functionNameStyle = {
  'margin-top': '1em',
  'font-size': '1.2em'
};

var linkStyle = {
  'font-size': '0.9em'
};

var anchorStyle = {
  'text-decoration': 'none',
  color: darkGray
};

var traceStyle = {
  'font-size': '1em'
};

var depStyle = {
  'font-size': '1.2em'
};

var primaryErrorStyle = {
  'background-color': lightRed
};

var secondaryErrorStyle = {
  'background-color': yellow
};

var omittedFramesStyle = {
  color: black,
  'font-size': '0.9em',
  'margin': '1.5em 0',
  cursor: 'pointer'
};

var preStyle = {
  display: 'block',
  padding: '0.5em',
  'margin-top': '1.5em',
  'margin-bottom': '0px',
  'overflow-x': 'auto',
  'font-size': '1.1em',
  'white-space': 'pre'
};

var toggleStyle = {
  'margin-bottom': '1.5em',
  color: darkGray,
  cursor: 'pointer'
};

var codeStyle = {
  'font-family': 'Consolas, Menlo, monospace'
};

var hiddenStyle = {
  display: 'none'
};

var groupStyle = {
  'margin-left': '1em'
};

var _groupElemStyle = {
  'background-color': 'inherit',
  'border-color': '#ddd',
  'border-width': '1px',
  'border-radius': '4px',
  'border-style': 'solid',
  padding: '3px 6px',
  cursor: 'pointer'
};

var groupElemLeft = Object.assign({}, _groupElemStyle, {
  'border-top-right-radius': '0px',
  'border-bottom-right-radius': '0px',
  'margin-right': '0px'
});

var groupElemRight = Object.assign({}, _groupElemStyle, {
  'border-top-left-radius': '0px',
  'border-bottom-left-radius': '0px',
  'margin-left': '-1px'
});

var footerStyle = {
  'text-align': 'center',
  color: darkGray
};

function applyStyles(element, styles) {
  element.setAttribute('style', '');
  // Firefox can't handle const due to non-compliant implementation
  // Revisit Jan 2016
  // https://developer.mozilla.org/en-US/Firefox/Releases/51#JavaScript
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1101653
  for (var key in styles) {
    if (!styles.hasOwnProperty(key)) continue;
    var val = styles[key];
    if (typeof val === 'function') val = val();
    element.style[key] = val.toString();
  }
}

var overlayReference = null;
var additionalReference = null;
var capturedErrors = [];
var viewIndex = -1;
var frameSettings = [];

function consumeEvent(e) {
  e.preventDefault();
  e.target.blur();
}

function accessify(node) {
  node.setAttribute('tabindex', 0);
  node.addEventListener('keydown', function (e) {
    var key = e.key,
        which = e.which,
        keyCode = e.keyCode;
    if (key === 'Enter' || which === 13 || keyCode === 13) {
      e.preventDefault();
      e.target.click();
    }
  });
}

function renderAdditional() {
  if (additionalReference.lastChild) {
    additionalReference.removeChild(additionalReference.lastChild);
  }

  var text = ' ';
  if (capturedErrors.length <= 1) {
    additionalReference.appendChild(document.createTextNode(text));
    return;
  }
  text = 'Errors ' + (viewIndex + 1) + ' of ' + capturedErrors.length;
  var span = document.createElement('span');
  span.appendChild(document.createTextNode(text));
  var group = document.createElement('span');
  applyStyles(group, groupStyle);
  var left = document.createElement('button');
  applyStyles(left, groupElemLeft);
  left.addEventListener('click', function (e) {
    consumeEvent(e);
    switchError(-1);
  });
  left.appendChild(document.createTextNode('←'));
  accessify(left);
  var right = document.createElement('button');
  applyStyles(right, groupElemRight);
  right.addEventListener('click', function (e) {
    consumeEvent(e);
    switchError(1);
  });
  right.appendChild(document.createTextNode('→'));
  accessify(right);
  group.appendChild(left);
  group.appendChild(right);
  span.appendChild(group);
  additionalReference.appendChild(span);
}

function removeNextBr(parent, component) {
  while (component != null && component.tagName.toLowerCase() !== 'br') {
    component = component.nextSibling;
  }
  if (component != null) {
    parent.removeChild(component);
  }
}

function absolutifyCode(component) {
  var ccn = component.childNodes;
  for (var index = 0; index < ccn.length; ++index) {
    var c = ccn[index];
    if (c.tagName.toLowerCase() !== 'span') continue;
    var text = c.innerText.replace(/\s/g, '');
    if (text !== '|^') continue;
    c.style.position = 'absolute';
    removeNextBr(component, c);
  }
}

function sourceCodePre(sourceLines, lineNum, columnNum) {
  var main = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  var sourceCode = [];
  var whiteSpace = Infinity;
  sourceLines.forEach(function (_ref2) {
    var text = _ref2.text;

    var m = text.match(/^\s*/);
    if (text === '') return;
    if (m && m[0]) {
      whiteSpace = Math.min(whiteSpace, m[0].length);
    } else {
      whiteSpace = 0;
    }
  });
  sourceLines.forEach(function (_ref3) {
    var text = _ref3.text,
        line = _ref3.line;

    if (isFinite(whiteSpace)) text = text.substring(whiteSpace);
    sourceCode[line - 1] = text;
  });
  sourceCode = sourceCode.join('\n');
  var ansiHighlight = codeFrame(sourceCode, lineNum, columnNum - (isFinite(whiteSpace) ? whiteSpace : 0), {
    forceColor: true,
    linesAbove: CONTEXT_SIZE,
    linesBelow: CONTEXT_SIZE
  });
  var htmlHighlight = ansiHTML(ansiHighlight);
  var code = document.createElement('code');
  code.innerHTML = htmlHighlight;
  absolutifyCode(code);
  applyStyles(code, codeStyle);

  var ccn = code.childNodes;
  for (var index = 0; index < ccn.length; ++index) {
    var node = ccn[index];
    var breakOut = false;
    var ccn2 = node.childNodes;
    for (var index2 = 0; index2 < ccn2.length; ++index2) {
      var lineNode = ccn2[index2];
      if (lineNode.innerText.indexOf(' ' + lineNum + ' |') === -1) continue;
      applyStyles(node, main ? primaryErrorStyle : secondaryErrorStyle);
      breakOut = true;
    }
    if (breakOut) break;
  }
  var pre = document.createElement('pre');
  applyStyles(pre, preStyle);
  pre.appendChild(code);
  return pre;
}

function createHint(hint) {
  var span = document.createElement('span');
  span.appendChild(document.createTextNode(hint));
  applyStyles(span, hintStyle);
  return span;
}

function hintsDiv() {
  var hints = document.createElement('div');
  applyStyles(hints, hintsStyle);

  var close = createHint('×');
  close.addEventListener('click', function () {
    unmount();
  });
  applyStyles(close, closeButtonStyle);
  hints.appendChild(close);
  return hints;
}

function frameDiv(functionName, url, internalUrl) {
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
    applyStyles(frameFunctionName, Object.assign({}, functionNameStyle, depStyle));
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

function getGroupToggle(omitsCount, omitBundle) {
  var omittedFrames = document.createElement('div');
  accessify(omittedFrames);
  var text1 = document.createTextNode('\u25B6 ' + omitsCount + ' stack frames were collapsed.');
  omittedFrames.appendChild(text1);
  omittedFrames.addEventListener('click', function () {
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

function insertBeforeBundle(parent, omitsCount, omitBundle, actionElement) {
  var children = document.getElementsByName('bundle-' + omitBundle);
  if (children.length < 1) return;
  var first = children[0];
  while (first.parentNode !== parent) {
    first = first.parentNode;
  }
  var div = document.createElement('div');
  accessify(div);
  div.setAttribute('name', 'bundle-' + omitBundle);
  var text = document.createTextNode('\u25BC ' + omitsCount + ' stack frames were expanded.');
  div.appendChild(text);
  div.addEventListener('click', function () {
    return actionElement.click();
  });
  applyStyles(div, omittedFramesStyle);
  div.style.display = 'none';

  parent.insertBefore(div, first);
}

function traceFrame(frameSetting, frame, critical, omits, omitBundle, parentContainer, lastElement) {
  var compiled = frameSetting.compiled;
  var functionName = frame.functionName,
      fileName = frame.fileName,
      lineNumber = frame.lineNumber,
      columnNumber = frame.columnNumber,
      scriptLines = frame.scriptLines,
      sourceFileName = frame.sourceFileName,
      sourceLineNumber = frame.sourceLineNumber,
      sourceColumnNumber = frame.sourceColumnNumber,
      sourceLines = frame.sourceLines;

  var url = void 0;
  if (!compiled && sourceFileName) {
    url = sourceFileName + ':' + sourceLineNumber;
    if (sourceColumnNumber) url += ':' + sourceColumnNumber;
  } else {
    url = fileName + ':' + lineNumber;
    if (columnNumber) url += ':' + columnNumber;
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
      var omittedFrames = getGroupToggle(omits.value, omitBundle);
      setTimeout(function () {
        insertBeforeBundle.apply(undefined, arguments);
      }.bind(undefined, parentContainer, omits.value, omitBundle, omittedFrames), 1);
      if (lastElement && internalUrl) {
        collapseElement = omittedFrames;
      } else {
        parentContainer.appendChild(omittedFrames);
      }
      ++omits.bundle;
    }
    omits.value = 0;
  }

  var elem = frameDiv(functionName, url, internalUrl);
  if (needsHidden) {
    applyStyles(elem, hiddenStyle);
    elem.setAttribute('name', 'bundle-' + omitBundle);
  }

  var hasSource = false;
  if (!internalUrl) {
    if (compiled && scriptLines.length !== 0) {
      elem.appendChild(sourceCodePre(scriptLines, lineNumber, columnNumber, critical));
      hasSource = true;
    } else if (!compiled && sourceLines.length !== 0) {
      elem.appendChild(sourceCodePre(sourceLines, sourceLineNumber, sourceColumnNumber, critical));
      hasSource = true;
    }
  }

  return { elem: elem, hasSource: hasSource, collapseElement: collapseElement };
}

function lazyFrame(parent, factory, lIndex) {
  var fac = factory();
  if (fac == null) return;
  var hasSource = fac.hasSource,
      elem = fac.elem,
      collapseElement = fac.collapseElement;

  var elemWrapper = document.createElement('div');
  elemWrapper.appendChild(elem);

  if (hasSource) {
    (function () {
      var compiledDiv = document.createElement('div');
      accessify(compiledDiv);
      applyStyles(compiledDiv, toggleStyle);

      var o = frameSettings[lIndex];
      var compiledText = document.createTextNode('View ' + (o && o.compiled ? 'source' : 'compiled'));
      compiledDiv.addEventListener('click', function () {
        if (o) o.compiled = !o.compiled;

        var next = lazyFrame(parent, factory, lIndex);
        if (next != null) {
          parent.insertBefore(next, elemWrapper);
          parent.removeChild(elemWrapper);
        }
      });
      compiledDiv.appendChild(compiledText);
      elemWrapper.appendChild(compiledDiv);
    })();
  }

  if (collapseElement != null) {
    elemWrapper.appendChild(collapseElement);
  }

  return elemWrapper;
}

function traceDiv(resolvedFrames) {
  var trace = document.createElement('div');
  applyStyles(trace, traceStyle);

  var index = 0;
  var critical = true;
  var omits = { value: 0, bundle: 1 };
  resolvedFrames.forEach(function (frame) {
    var lIndex = index++;
    var elem = lazyFrame(trace, traceFrame.bind(undefined, frameSettings[lIndex], frame, critical, omits, omits.bundle, trace, index === resolvedFrames.length), lIndex);
    if (elem == null) return;
    critical = false;
    trace.appendChild(elem);
  });
  //TODO: fix this
  omits.value = 0;

  return trace;
}

function footer() {
  var div = document.createElement('div');
  applyStyles(div, footerStyle);
  div.appendChild(document.createTextNode('This screen is visible only in development. It will not appear when the app crashes in production.'));
  div.appendChild(document.createElement('br'));
  div.appendChild(document.createTextNode('Open your browser’s developer console to further inspect this error.'));
  return div;
}

function render(error, name, message, resolvedFrames) {
  dispose();

  frameSettings = resolvedFrames.map(function () {
    return { compiled: false };
  });

  injectCss(css);

  // Create overlay
  var overlay = document.createElement('div');
  applyStyles(overlay, overlayStyle);
  overlay.appendChild(hintsDiv());

  // Create container
  var container = document.createElement('div');
  container.className = 'cra-container';
  overlay.appendChild(container);

  // Create additional
  additionalReference = document.createElement('div');
  applyStyles(additionalReference, additionalStyle);
  container.appendChild(additionalReference);
  renderAdditional();

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
  container.appendChild(traceDiv(resolvedFrames));

  // Show message
  container.appendChild(footer());

  // Mount
  document.body.appendChild(overlayReference = overlay);
}

function dispose() {
  if (overlayReference === null) return;
  document.body.removeChild(overlayReference);
  overlayReference = null;
  var head = getHead();
  injectedCss.forEach(function (node) {
    head.removeChild(node);
  });
  injectedCss = [];
}

function unmount() {
  dispose();
  capturedErrors = [];
  viewIndex = -1;
}

function isInternalFile(url, sourceFileName) {
  return url.indexOf('/~/') !== -1 || url.trim().indexOf(' ') !== -1 || !sourceFileName;
}

function renderError(index) {
  viewIndex = index;
  var _capturedErrors$index = capturedErrors[index],
      error = _capturedErrors$index.error,
      unhandledRejection = _capturedErrors$index.unhandledRejection,
      resolvedFrames = _capturedErrors$index.resolvedFrames;

  if (unhandledRejection) {
    render(error, 'Unhandled Rejection (' + error.name + ')', error.message, resolvedFrames);
  } else {
    render(error, error.name, error.message, resolvedFrames);
  }
}

function crash(error) {
  var unhandledRejection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var sourceOverrides = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

  if (module.hot) module.hot.decline();

  StackTraceResolve(error, CONTEXT_SIZE).then(function (resolvedFrames) {
    resolvedFrames = resolvedFrames.filter(function (_ref) {
      var functionName = _ref.functionName;
      return functionName.indexOf('__cra_proxy_console__') === -1;
    });
    var overrideCount = sourceOverrides.length,
        frameCount = resolvedFrames.length;
    var frameIndex = 0;
    for (var overrideIndex = 0; overrideIndex < overrideCount; ++overrideIndex) {
      var tag = sourceOverrides[overrideIndex];
      var shouldContinue = false;
      for (; frameIndex < frameCount; ++frameIndex) {
        var sourceFileName = resolvedFrames[frameIndex].sourceFileName;

        if (sourceFileName == null) continue;
        if (sourceFileName.indexOf('/' + tag.file) !== -1) {
          var prevLineNumber = resolvedFrames[frameIndex].sourceLineNumber;
          if (Math.abs(prevLineNumber - tag.lineNum) < CONTEXT_SIZE) {
            resolvedFrames[frameIndex].sourceLineNumber = tag.lineNum;
          }
          shouldContinue = true;
          break;
        }
      }
      if (shouldContinue) continue;
      break;
    }
    capturedErrors.push({ error: error, unhandledRejection: unhandledRejection, resolvedFrames: resolvedFrames });
    if (overlayReference !== null) renderAdditional();
    else {
      renderError(viewIndex = 0);
    }
  }).catch(function (e) {
    // This is another fail case (unlikely to happen)
    // e.g. render(...) throws an error with provided arguments
    console.log('Red box renderer error:', e);
    unmount();
    render(null, 'Error', 'There is an error with red box. *Please* report this (see console).', []);
  });
}

function switchError(offset) {
  try {
    var nextView = viewIndex + offset;
    if (nextView < 0 || nextView >= capturedErrors.length) return;
    renderError(nextView);
  } catch (e) {
    console.log('Red box renderer error:', e);
    unmount();
    render(null, 'Error', 'There is an error with red box. *Please* report this (see console).', []);
  }
}

window.onerror = function (messageOrEvent, source, lineno, colno, error) {
  if (error == null || !(error instanceof Error) || messageOrEvent.indexOf('Script error') !== -1) {
    crash(new Error(error || messageOrEvent)); // TODO: more helpful message
  } else {
    crash(error);
  }
};

var promiseHandler = function promiseHandler(event) {
  if (event != null && event.reason != null) {
    var reason = event.reason;

    if (reason == null || !(reason instanceof Error)) {
      crash(new Error(reason), true);
    } else {
      crash(reason, true);
    }
  } else {
    crash(new Error('Unknown event'), true);
  }
};

window.addEventListener('unhandledrejection', promiseHandler);

var escapeHandler = function escapeHandler(event) {
  var key = event.key,
      keyCode = event.keyCode,
      which = event.which;

  if (key === 'Escape' || keyCode === 27 || which === 27) unmount();
  else if (key === 'ArrowLeft' || keyCode === 37 || which === 37) switchError(-1);
  else if (key === 'ArrowRight' || keyCode === 39 || which === 39) switchError(1);
};

window.addEventListener('keydown', escapeHandler);

try {
  Error.stackTraceLimit = 50;
} catch (e) {
  // Browser may not support this, we don't care.
}

// eslint-disable-next-line
var proxyConsole = function proxyConsole(type) {
  var orig = console[type];
  console[type] = function __cra_proxy_console__() {
    var warning = [].slice.call(arguments).join(' ');
    var nIndex = warning.indexOf('\n');
    var message = warning;
    if (nIndex !== -1) message = message.substring(0, nIndex);
    var stack = warning.substring(nIndex + 1).split('\n').filter(function (line) {
      return line.indexOf('(at ') !== -1;
    }).map(function (line) {
      var prefix = '(at ';
      var suffix = ')';
      line = line.substring(line.indexOf(prefix) + prefix.length);
      line = line.substring(0, line.indexOf(suffix));
      var parts = line.split(/[:]/g);
      if (parts.length !== 2) return null;
      var file = parts[0];
      var lineNum = Number(parts[1]);
      if (isNaN(lineNum)) return null;
      return { file: file, lineNum: lineNum };
    }).filter(function (obj) {
      return obj !== null;
    });
    var error = void 0;
    try {
      throw new Error(message);
    } catch (e) {
      error = e;
    }
    setTimeout(function () {
      return crash(error, false, stack);
    });
    return orig.apply(this, arguments);
  };
};

// proxyConsole('error');

if (module.hot) {
  module.hot.dispose(function () {
    unmount();
    window.removeEventListener('unhandledrejection', promiseHandler);
    window.removeEventListener('keydown', escapeHandler);
  });
}
