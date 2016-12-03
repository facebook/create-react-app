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
  'white-space': 'pre',
  overflow: 'auto',
  'box-shadow': '0 0 6px 0 rgba(0, 0, 0, 0.5)',
  'line-height': 1.5,
}

// TODO: reapply containerStyle on resize or externalize to css and ensure
//  e2e checks & tests pass
//  ref commit: 46db1ae54c0449b737f82fb1cf8a47b7457d5b9b
const containerStyle = {
  'margin': '0 auto',
  width: () => calcWidth(window.innerWidth)
}

const hintsStyle = {
  'font-size': '0.8em',
  'margin-top': '-3em',
  'margin-bottom': '3em',
  'text-align': 'right',
  color: darkGray
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
}

const preStyle = {
  display: 'block',
  padding: '0.5em',
  'margin-top': '1.5em',
  'margin-bottom': '0px',
  'overflow-x': 'auto',
  'font-size': '1.1em'
}

const toggleStyle = {
  'margin-bottom': '1.5em'
}

const codeStyle = {
  'font-family': 'Consolas, Menlo, monospace',
}

const hiddenStyle = {
  display: 'none'
}

function calcWidth(width) {
  if (width >= 1200) return '1170px'
  if (width >= 992) return '970px'
  if (width >= 768) return '750px'
  return 'auto'
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
let frameSettings = []
let additionalCount = 0

function renderAdditional() {
  ++additionalCount
  const title = overlayReference.childNodes[1].childNodes[0]
  const children = title.childNodes
  const text = document.createTextNode(` (+${additionalCount} more)`)
  if (children.length < 2) {
    title.appendChild(text)
  } else {
    title.removeChild(children[children.length - 1])
    title.appendChild(text)
  }
}

function sourceCodePre(sourceLines, lineNum, columnNum, main = false) {
  let sourceCode = []
  sourceLines.forEach(({ text, line }) => {
    sourceCode[line - 1] = text
  })
  sourceCode = sourceCode.join('\n')
  const ansiHighlight = codeFrame(sourceCode, lineNum, columnNum, {
    highlightCode: true,
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

function hintsDiv() {
  const hints = document.createElement('div')
  hints.appendChild(document.createTextNode('[escape] Close'))
  hints.addEventListener('click', e => {
    unmount()
  })
  applyStyles(hints, hintsStyle)
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

function traceFrame(frameSetting, frame, critical, omits, omitBundle, parentContainer) {
  const { compiled } = frameSetting
  const {
    functionName,
    fileName, lineNumber, columnNumber,
    scriptLines,
    sourceFileName, sourceLineNumber, sourceColumnNumber,
    sourceLines
  } = frame

  // Skip native functions like Array.forEach
  if (fileName === '(native)') return

  let url
  if (!compiled && sourceFileName) {
    url = sourceFileName + ':' + sourceLineNumber
    if (sourceColumnNumber) url += ':' + sourceColumnNumber
  } else {
    url = fileName + ':' + lineNumber
    if (columnNumber) url += ':' + columnNumber
  }

  let needsHidden = false
  const internalUrl = isInternalFile(url)
  if (internalUrl) {
    ++omits.value
    needsHidden = true
  } else {
    if (omits.value > 0) {
      const omittedFrames = document.createElement('div')
      const text1 = document.createTextNode(`${omits.value} stack frames were omitted.`)
      const text2 = document.createTextNode(`[Click to expand]`)
      omittedFrames.appendChild(text1)
      omittedFrames.appendChild(document.createElement('br'))
      omittedFrames.appendChild(text2)
      omittedFrames.addEventListener('click', e => {
        const hide = text2.textContent.match(/collapse/)
        document.getElementsByName(`bundle-${omitBundle}`).forEach(n => {
          if (hide) {
            n.style.display = 'none'
          } else {
            n.style.display = ''
          }
        })
        if (hide) {
          text1.textContent = text1.textContent.replace(/will be/, 'were')
          text2.textContent = text2.textContent.replace(/collapse/, 'expand')
        } else {
          text1.textContent = text1.textContent.replace(/were/, 'will be')
          text2.textContent = text2.textContent.replace(/expand/, 'collapse')
        }
      })
      applyStyles(omittedFrames, omittedFramesStyle)
      parentContainer.appendChild(omittedFrames)
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

  return { elem, hasSource }
}

function getAnchor(text, call) {
  const anchor = document.createElement('a')
  anchor.href = '#'
  applyStyles(anchor, anchorStyle)
  anchor.appendChild(document.createTextNode(text))
  anchor.addEventListener('click', e => {
    e.preventDefault()
    e.target.blur()

    call()
  })
  return anchor
}

function lazyFrame(parent, factory, lIndex) {
  const fac = factory()
  if (fac == null) return
  const { hasSource, elem } = fac

  const elemWrapper = document.createElement('div')
  elemWrapper.appendChild(elem)

  const compiledDiv = document.createElement('div')
  applyStyles(compiledDiv, toggleStyle)
  if (hasSource) {
    const sourceAnchor = getAnchor('Source', () => {
      const o = frameSettings[lIndex]
      if (o) o.compiled = false

      const next = lazyFrame(parent, factory, lIndex)
      if (next != null) {
        parent.insertBefore(next, elemWrapper)
        parent.removeChild(elemWrapper)
      }
    })
    const compiledAnchor = getAnchor('Compiled', () => {
      const o = frameSettings[lIndex]
      if (o) o.compiled = true

      const next = lazyFrame(parent, factory, lIndex)
      if (next != null) {
        parent.insertBefore(next, elemWrapper)
        parent.removeChild(elemWrapper)
      }
    })
    compiledDiv.appendChild(sourceAnchor)
    compiledDiv.appendChild(document.createTextNode(' <-> '))
    compiledDiv.appendChild(compiledAnchor)
  }
  elemWrapper.appendChild(compiledDiv)

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
      traceFrame.bind(undefined, frameSettings[lIndex], frame, critical, omits, omits.bundle, trace),
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

function render(error, name, message, resolvedFrames) {
  if (overlayReference !== null) {
    renderAdditional()
    return
  }
  frameSettings = resolvedFrames.map(() => { return { compiled: false } })

  // Create overlay
  const overlay = document.createElement('div')
  applyStyles(overlay, overlayStyle)
  overlay.appendChild(hintsDiv())

  // Create container
  const container = document.createElement('div')
  applyStyles(container, containerStyle)
  overlay.appendChild(container)

  // Create header
  const header = document.createElement('div')
  applyStyles(header, headerStyle)
  header.appendChild(document.createTextNode(`${name}: ${message}`))
  container.appendChild(header)

  // Create trace
  container.appendChild(traceDiv(resolvedFrames))

  // Mount
  document.body.appendChild(overlayReference = overlay)
  additionalCount = 0
}

function unmount() {
  if (overlayReference === null) return
  document.body.removeChild(overlayReference)
  overlayReference = null
}

function isInternalFile(url) {
  return url.indexOf('/~/') !== -1 || url.trim().indexOf(' ') !== -1
}

function crash(error, unhandledRejection = false) {
  if (module.hot) module.hot.decline()

  StackTraceResolve(error, CONTEXT_SIZE).then(function(resolvedFrames) {
    if (unhandledRejection) {
      render(error, `Unhandled Rejection (${error.name})`, error.message, resolvedFrames)
    } else {
      render(error, error.name, error.message, resolvedFrames)
    }
  }).catch(function(e) {
    // This is another fail case (unlikely to happen)
    // e.g. render(...) throws an error with provided arguments
    console.log('Red box renderer error:', e)
    render(null, 'Error', 'Unknown Error (failure to materialize)', [])
  })
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
