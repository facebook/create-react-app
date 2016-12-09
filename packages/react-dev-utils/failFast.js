const codeFrame = require('babel-code-frame')
const ansiHTML = require('./ansiHTML')
const StackTraceResolve = require('stacktrace-resolve').default

const CONTEXT_SIZE = 3

const black = '#293238'
const darkGray = '#878e91'
const lightGray = '#fafafa'
const red = '#ce1126'
const lightRed = '#fccfcf'
const yellow = '#fbf5b4'

function getHead() {
  return document.head || document.getElementsByTagName('head')[0]
}

let injectedCss = []

// From: http://stackoverflow.com/a/524721/127629
function injectCss(css) {
  const head = getHead()
  const style = document.createElement('style')

  style.type = 'text/css'
  if (style.styleSheet) {
    style.styleSheet.cssText = css
  } else {
    style.appendChild(document.createTextNode(css))
  }

  head.appendChild(style)
  injectedCss.push(style)
}

const css = `
.cra-container {
  padding-right: 15px;
  padding-left: 15px;
  margin-right: auto;
  margin-left: auto;
}

@media (min-width: 768px) {
  .cra-container {
    width: calc(750px - 6em);
  }
}

@media (min-width: 992px) {
  .cra-container {
    width: calc(970px - 6em);
  }
}

@media (min-width: 1200px) {
  .cra-container {
    width: calc(1170px - 6em);
  }
}
`

const overlayStyle = {
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
  'line-height': 1.5,
}

const hintsStyle = {
  'font-size': '0.8em',
  'margin-top': '-3em',
  'margin-bottom': '3em',
  'text-align': 'right',
  color: darkGray
}

const hintStyle = {
  padding: '0.5em 1em',
  cursor: 'pointer'
}

const closeButtonStyle = {
  'font-size': '26px',
  color: black,
  padding: '0.5em 1em',
  cursor: 'pointer',
  position: 'absolute',
  right: 0,
  top: 0,
}

const additionalStyle = {
  'margin-bottom': '1.5em',
  'margin-top': '-4em',
}

const headerStyle = {
  'font-size': '1.7em',
  'font-weight': 'bold',
  color: red
}

const functionNameStyle = {
  'margin-top': '1em',
  'font-size': '1.2em'
}

const linkStyle = {
  'font-size': '0.9em',
}

const anchorStyle = {
  'text-decoration': 'none',
  color: darkGray
}

const traceStyle = {
  'font-size': '1em'
}

const depStyle = {
  'font-size': '1.2em',
}

const primaryErrorStyle = {
  'background-color': lightRed
}

const secondaryErrorStyle = {
  'background-color': yellow
}

const omittedFramesStyle = {
  color: black,
  'font-size': '0.9em',
  'margin': '1.5em 0',
  cursor: 'pointer'
}

const preStyle = {
  display: 'block',
  padding: '0.5em',
  'margin-top': '1.5em',
  'margin-bottom': '0px',
  'overflow-x': 'auto',
  'font-size': '1.1em',
  'white-space': 'pre',
}

const toggleStyle = {
  'margin-bottom': '1.5em',
  color: darkGray,
  cursor: 'pointer'
}

const codeStyle = {
  'font-family': 'Consolas, Menlo, monospace',
}

const hiddenStyle = {
  display: 'none'
}

const groupStyle = {
  'margin-left': '1em'
}

const _groupElemStyle = {
  'border-color': '#ddd',
  'border-width': '1px',
  'border-radius': '4px',
  'border-style': 'solid',
  padding: '3px 6px',
  cursor: 'pointer'
}

const groupElemLeft = Object.assign({}, _groupElemStyle, {
  'border-top-right-radius': '0px',
  'border-bottom-right-radius': '0px',
  'margin-right': '0px'
})

const groupElemRight = Object.assign({}, _groupElemStyle, {
  'border-top-left-radius': '0px',
  'border-bottom-left-radius': '0px',
  'margin-left': '-1px'
})

const footerStyle = {
  'text-align': 'center',
  color: darkGray
}

function applyStyles(element, styles) {
  element.setAttribute('style', '')
  // Firefox can't handle const due to non-compliant implementation
  // Revisit Jan 2016
  // https://developer.mozilla.org/en-US/Firefox/Releases/51#JavaScript
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1101653
  for (let key in styles) {
    if (!styles.hasOwnProperty(key)) continue
    let val = styles[key]
    if (typeof val === 'function') val = val()
    element.style[key] = val.toString()
  }
}

let overlayReference = null
let additionalReference = null
let capturedErrors = []
let viewIndex = -1
let frameSettings = []

function renderAdditional() {
  if (additionalReference.lastChild) {
    additionalReference.removeChild(additionalReference.lastChild)
  }

  let text = ' '
  if (capturedErrors.length <= 1) {
    additionalReference.appendChild(document.createTextNode(text))
    return
  }
  text = `Errors ${viewIndex + 1} of ${capturedErrors.length}`
  const span = document.createElement('span')
  span.appendChild(document.createTextNode(text))
  const group = document.createElement('span')
  applyStyles(group, groupStyle)
  const left = document.createElement('span')
  applyStyles(left, groupElemLeft)
  left.addEventListener('click', () => switchError(-1))
  left.appendChild(document.createTextNode('←'))
  const right = document.createElement('span')
  applyStyles(right, groupElemRight)
  right.addEventListener('click', () => switchError(1))
  right.appendChild(document.createTextNode('→'))
  group.appendChild(left)
  group.appendChild(right)
  span.appendChild(group)
  additionalReference.appendChild(span)
}

function sourceCodePre(sourceLines, lineNum, columnNum, main = false) {
  let sourceCode = []
  let whiteSpace = Infinity
  sourceLines.forEach(({ text }) => {
    const m = text.match(/^\s*/)
    if (text === '') return
    if (m && m[0]) {
      whiteSpace = Math.min(whiteSpace, m[0].length)
    } else {
      whiteSpace = 0
    }
  })
  sourceLines.forEach(({ text, line }) => {
    if (isFinite(whiteSpace)) text = text.substring(whiteSpace)
    sourceCode[line - 1] = text
  })
  sourceCode = sourceCode.join('\n')
  const ansiHighlight = codeFrame(sourceCode, lineNum, columnNum - (isFinite(whiteSpace) ? whiteSpace : 0), {
    forceColor: true,
    linesAbove: CONTEXT_SIZE,
    linesBelow: CONTEXT_SIZE
  })
  const htmlHighlight = ansiHTML(ansiHighlight)
  const code = document.createElement('code')
  code.innerHTML = htmlHighlight
  applyStyles(code, codeStyle)

  for (let node of code.childNodes) {
    let breakOut = false
    for (let lineNode of node.childNodes) {
      if (lineNode.innerText.indexOf(` ${lineNum} |`) === -1) continue
      applyStyles(node, main ? primaryErrorStyle : secondaryErrorStyle)
      breakOut = true
    }
    if (breakOut) break
  }
  const pre = document.createElement('pre')
  applyStyles(pre, preStyle)
  pre.appendChild(code)
  return pre
}

function createHint(hint) {
  const span = document.createElement('span')
  span.appendChild(document.createTextNode(hint))
  applyStyles(span, hintStyle)
  return span
}

function hintsDiv() {
  const hints = document.createElement('div')
  applyStyles(hints, hintsStyle)

  const close = createHint('×')
  close.addEventListener('click', e => {
    unmount()
  })
  applyStyles(close, closeButtonStyle)
  hints.appendChild(close)
  return hints
}

function frameDiv(functionName, url, internalUrl) {
  const frame = document.createElement('div')
  const frameFunctionName = document.createElement('div')

  let cleanedFunctionName
  if (!functionName || functionName === 'Object.<anonymous>') {
    cleanedFunctionName = '(anonymous function)'
  } else {
    cleanedFunctionName = functionName
  }

  let cleanedUrl = url.replace('webpack://', '.')

  if (internalUrl) {
    applyStyles(frameFunctionName, Object.assign({}, functionNameStyle, depStyle))
  } else {
    applyStyles(frameFunctionName, functionNameStyle)
  }

  frameFunctionName.appendChild(document.createTextNode(cleanedFunctionName))
  frame.appendChild(frameFunctionName)

  const frameLink = document.createElement('div')
  applyStyles(frameLink, linkStyle)
  const frameAnchor = document.createElement('a')
  applyStyles(frameAnchor, anchorStyle)
  //frameAnchor.href = url
  frameAnchor.appendChild(document.createTextNode(cleanedUrl))
  frameLink.appendChild(frameAnchor)
  frame.appendChild(frameLink)

  return frame
}

function getGroupToggle(omitsCount, omitBundle) {
  const omittedFrames = document.createElement('div')
  const text1 = document.createTextNode(`▶ ${omitsCount} stack frames were collapsed.`)
  omittedFrames.appendChild(text1)
  omittedFrames.addEventListener('click', e => {
    const hide = text1.textContent.match(/▲/)
    document.getElementsByName(`bundle-${omitBundle}`).forEach(n => {
      if (hide) {
        n.style.display = 'none'
      } else {
        n.style.display = ''
      }
    })
    if (hide) {
      text1.textContent = text1.textContent.replace(/▲/, '▶')
      text1.textContent = text1.textContent.replace(/expanded/, 'collapsed')
    } else {
      text1.textContent = text1.textContent.replace(/▶/, '▲')
      text1.textContent = text1.textContent.replace(/collapsed/, 'expanded')
    }
  })
  applyStyles(omittedFrames, omittedFramesStyle)

  return omittedFrames
}

function traceFrame(frameSetting, frame, critical, omits, omitBundle, parentContainer, lastElement) {
  const { compiled } = frameSetting
  const {
    functionName,
    fileName, lineNumber, columnNumber,
    scriptLines,
    sourceFileName, sourceLineNumber, sourceColumnNumber,
    sourceLines
  } = frame

  let url
  if (!compiled && sourceFileName) {
    url = sourceFileName + ':' + sourceLineNumber
    if (sourceColumnNumber) url += ':' + sourceColumnNumber
  } else {
    url = fileName + ':' + lineNumber
    if (columnNumber) url += ':' + columnNumber
  }

  let needsHidden = false
  const internalUrl = isInternalFile(url, sourceFileName)
  if (internalUrl) {
    ++omits.value
    needsHidden = true
  }
  let collapseElement = null
  if (!internalUrl || lastElement) {
    if (omits.value > 0) {
      const omittedFrames = getGroupToggle(omits, omitBundle)
      if (lastElement && internalUrl) {
        collapseElement = omittedFrames
      } else {
        parentContainer.appendChild(omittedFrames)
      }
      ++omits.bundle
    }
    omits.value = 0
  }

  const elem = frameDiv(functionName, url, internalUrl)
  if (needsHidden) {
    applyStyles(elem, hiddenStyle)
    elem.setAttribute('name', `bundle-${omitBundle}`)
  }

  let hasSource = false
  if (!internalUrl) {
    if (compiled && scriptLines.length !== 0) {
      elem.appendChild(sourceCodePre(scriptLines, lineNumber, columnNumber, critical))
      hasSource = true
    } else if (!compiled && sourceLines.length !== 0) {
      elem.appendChild(sourceCodePre(sourceLines, sourceLineNumber, sourceColumnNumber, critical))
      hasSource = true
    }
  }

  return { elem, hasSource, collapseElement }
}

function lazyFrame(parent, factory, lIndex) {
  const fac = factory()
  if (fac == null) return
  const { hasSource, elem, collapseElement } = fac

  const elemWrapper = document.createElement('div')
  elemWrapper.appendChild(elem)

  if (hasSource) {
    const compiledDiv = document.createElement('div')
    applyStyles(compiledDiv, toggleStyle)

    const o = frameSettings[lIndex]
    const compiledText = document.createTextNode(`View ${o && o.compiled ? 'source' : 'compiled'}`)
    compiledDiv.addEventListener('click', () => {
      if (o) o.compiled = !o.compiled

      const next = lazyFrame(parent, factory, lIndex)
      if (next != null) {
        parent.insertBefore(next, elemWrapper)
        parent.removeChild(elemWrapper)
      }
    })
    compiledDiv.appendChild(compiledText)
    elemWrapper.appendChild(compiledDiv)
  }

  if (collapseElement != null) {
    elemWrapper.appendChild(collapseElement)
  }

  return elemWrapper
}

function traceDiv(resolvedFrames) {
  const trace = document.createElement('div')
  applyStyles(trace, traceStyle)

  let index = 0
  let critical = true
  const omits = { value: 0, bundle: 1 }
  for (let frame of resolvedFrames) {
    const lIndex = index++
    const elem = lazyFrame(
      trace,
      traceFrame.bind(undefined, frameSettings[lIndex], frame, critical, omits, omits.bundle, trace, index === resolvedFrames.length),
      lIndex
    )
    if (elem == null) continue
    critical = false
    trace.appendChild(elem)
  }
  //TODO: fix this
  omits.value = 0

  return trace
}

function footer() {
  const div = document.createElement('div')
  applyStyles(div, footerStyle)
  div.appendChild(document.createTextNode('This screen is visible only in development. It will not appear when the app crashes in production.'))
  div.appendChild(document.createElement('br'))
  div.appendChild(document.createTextNode('Open your browser’s developer console to further inspect this error.'))
  return div
}

function render(error, name, message, resolvedFrames) {
  dispose()

  frameSettings = resolvedFrames.map(() => { return { compiled: false } })

  injectCss(css)

  // Create overlay
  const overlay = document.createElement('div')
  applyStyles(overlay, overlayStyle)
  overlay.appendChild(hintsDiv())

  // Create container
  const container = document.createElement('div')
  container.className = 'cra-container'
  overlay.appendChild(container)

  // Create additional
  additionalReference = document.createElement('div')
  applyStyles(additionalReference, additionalStyle)
  container.appendChild(additionalReference)
  renderAdditional()

  // Create header
  const header = document.createElement('div')
  applyStyles(header, headerStyle)
  header.appendChild(document.createTextNode(`${name}: ${message}`))
  container.appendChild(header)

  // Create trace
  container.appendChild(traceDiv(resolvedFrames))

  // Show message
  container.appendChild(footer())

  // Mount
  document.body.appendChild(overlayReference = overlay)
}

function dispose() {
  if (overlayReference === null) return
  document.body.removeChild(overlayReference)
  overlayReference = null
  const head = getHead()
  for (const node of injectedCss) {
    head.removeChild(node)
  }
  injectedCss = []
}

function unmount() {
  dispose()
  capturedErrors = []
  viewIndex = -1
}

function isInternalFile(url, sourceFileName) {
  return url.indexOf('/~/') !== -1 || url.trim().indexOf(' ') !== -1 || !sourceFileName
}

function renderError(index) {
  viewIndex = index
  const { error, unhandledRejection, resolvedFrames } = capturedErrors[index]
  if (unhandledRejection) {
    render(error, `Unhandled Rejection (${error.name})`, error.message, resolvedFrames)
  } else {
    render(error, error.name, error.message, resolvedFrames)
  }
}

function crash(error, unhandledRejection = false) {
  if (module.hot) module.hot.decline()

  StackTraceResolve(error, CONTEXT_SIZE).then(function(resolvedFrames) {
    capturedErrors.push({ error, unhandledRejection, resolvedFrames })
    if (overlayReference !== null) renderAdditional()
    else {
      renderError(viewIndex = 0)
    }
  }).catch(function(e) {
    // This is another fail case (unlikely to happen)
    // e.g. render(...) throws an error with provided arguments
    console.log('Red box renderer error:', e)
    unmount()
    render(null, 'Error', 'There is an error with red box. *Please* report this (see console).', [])
  })
}

function switchError(offset) {
  try {
    const nextView = viewIndex + offset
    if (nextView < 0 || nextView >= capturedErrors.length) return
    renderError(nextView)
  } catch (e) {
    console.log('Red box renderer error:', e)
    unmount()
    render(null, 'Error', 'There is an error with red box. *Please* report this (see console).', [])
  }
}

window.onerror = function(messageOrEvent, source, lineno, colno, error) {
  if (error == null || !(error instanceof Error) || messageOrEvent.indexOf('Script error') !== -1) {
    crash(new Error(error || messageOrEvent))// TODO: more helpful message
  } else {
    crash(error)
  }
}

let promiseHandler = function(event) {
  if (event != null && event.reason != null) {
    const { reason } = event
    if (reason == null || !(reason instanceof Error)) {
      crash(new Error(reason), true)
    } else {
      crash(reason, true)
    }
  } else {
    crash(new Error('Unknown event'), true)
  }
}

window.addEventListener('unhandledrejection', promiseHandler)

let escapeHandler = function(event) {
  const { key, keyCode, which } = event
  if (key === 'Escape' || keyCode === 27 || which === 27) unmount()
  else if (key === 'ArrowLeft' || keyCode === 37 || which === 37) switchError(-1)
  else if (key === 'ArrowRight' || keyCode === 39 || which === 39) switchError(1)
}

window.addEventListener('keydown', escapeHandler)

try {
  Error.stackTraceLimit = 50
} catch (e) { }

if (module.hot) {
  module.hot.dispose(function() {
    unmount()
    window.removeEventListener('unhandledrejection', promiseHandler)
    window.removeEventListener('keydown', escapeHandler)
  })
}
