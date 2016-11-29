(function() {
  const StackTraceResolve = require('stacktrace-resolve').default

  const CONTEXT_SIZE = 4

  const black = '#293238'
  const darkGray = '#878e91'
  const lightGray = '#fafafa'
  const red = '#ce1126'
  const yellow = '#FBF5B4'

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
    'box-shadow': '0 0 6px 0 rgba(0, 0, 0, 0.5)',
    'line-height': 1.5,
  }

  const containerStyle = {
    'max-width': '50%',
    'min-width': '600px',
    margin: '0 auto',
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
    color: darkGray
  }

  const preStyle = {
    'font-size': '1.1em',
    margin: '1.5em 0',
  }

  const contextStyle = {
    'background-color': yellow
  }

  const omittedFramesStyle = {
    color: black,
    'margin': '1.5em 0',
    'text-align': 'center'
  }

  function applyStyles(element, styles) {
    element.setAttribute('style', '')
    // Firefox can't handle const due to non-compliant implementation
    // Revisit Jan 2016
    // https://developer.mozilla.org/en-US/Firefox/Releases/51#JavaScript
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1101653
    for (let key in styles) {
      if (!styles.hasOwnProperty(key)) continue
      element.style[key] = styles[key].toString()
    }
  }

  let overlayReference = null
  let errorCache = null
  let additionalCount = 0
  let internalDisabled = true

  function toggleInternal() {
    internalDisabled = !internalDisabled
    if (errorCache != null) {
      unmount()
      crash(errorCache)
    }
  }

  function renderAdditional() {
    ++additionalCount
    const title = overlayReference.childNodes[1]
    const children = title.childNodes
    const text = document.createTextNode(` (+${additionalCount} more)`)
    if (children.length < 2) {
      title.appendChild(text)
    } else {
      title.removeChild(children[children.length - 1])
      title.appendChild(text)
    }
  }

  function render(error, name, message, resolvedFrames) {
    if (overlayReference !== null) {
      renderAdditional()
      return
    }
    // Create overlay
    const overlay = document.createElement('div')
    applyStyles(overlay, overlayStyle)

    const hints = document.createElement('div')
    hints.appendChild(document.createTextNode(`[=] ${internalDisabled ? 'Show' : 'Hide'} internal calls`))
    hints.appendChild(document.createTextNode('\t\t'))
    hints.appendChild(document.createTextNode('[escape] Close'))
    applyStyles(hints, hintsStyle)
    overlay.appendChild(hints)

    const container = document.createElement('div')
    applyStyles(container, containerStyle)
    overlay.appendChild(container)

    // Create header
    const header = document.createElement('div')
    applyStyles(header, headerStyle)
    header.appendChild(document.createTextNode(`${name}: ${message}`))
    container.appendChild(header)

    // Show trace
    const trace = document.createElement('div')
    applyStyles(trace, traceStyle)
    // Firefox can't handle const due to non-compliant implementation
    // Revisit Jan 2016
    // https://developer.mozilla.org/en-US/Firefox/Releases/51#JavaScript
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1101653
    let index = 0
    let omittedFramesCount = 0
    for (let frame of resolvedFrames) {
      const {
        functionName,
        fileName, lineNumber, columnNumber,
        scriptLines,
        sourceFileName, sourceLineNumber, sourceColumnNumber,
        sourceLines
      } = frame

      let url
      if (sourceFileName) {
        url = sourceFileName + ':' + sourceLineNumber + ':' + sourceColumnNumber
      } else {
        url = fileName + ':' + lineNumber + ':' + columnNumber
      }

      const internalUrl = isInternalFile(url)
      if (internalUrl && internalDisabled) {
        omittedFramesCount++
        continue
      }

      if (omittedFramesCount) {
        const omittedFrames = document.createElement('div')
        omittedFrames.appendChild(document.createTextNode(`---[ ${omittedFramesCount} internal calls hidden ]---`))
        applyStyles(omittedFrames, omittedFramesStyle)
        trace.appendChild(omittedFrames)
        omittedFramesCount = 0
      }

      const elem = document.createElement('div')

      const elemFunctionName = document.createElement('div')
      if (internalUrl) {
        applyStyles(elemFunctionName, Object.assign({}, functionNameStyle, depStyle))
      } else {
        applyStyles(elemFunctionName, functionNameStyle)
      }
      elemFunctionName.appendChild(document.createTextNode(functionName || '(anonymous function)'))
      elem.appendChild(elemFunctionName)

      const elemLink = document.createElement('div')
      applyStyles(elemLink, linkStyle)
      const elemAnchor = document.createElement('a')
      applyStyles(elemAnchor, anchorStyle)
      elemAnchor.href = url
      elemAnchor.appendChild(document.createTextNode(url))
      elemLink.appendChild(elemAnchor)
      elem.appendChild(elemLink)

      if (!internalUrl && sourceLines.length !== 0) {
        const pre = document.createElement('pre')
        applyStyles(pre, preStyle)

        for (let line of sourceLines) {
          const { context, text, line: fileLine } = line
          let modSource = (Array(11).join(' ') + fileLine).slice(-6) + (context ? '   | ' : ' > | ')
          modSource += text
          const lineElem = document.createElement('div')
          if (!context) applyStyles(lineElem, contextStyle)

          lineElem.appendChild(document.createTextNode(modSource))
          pre.appendChild(lineElem)
        }
        elem.appendChild(pre)
      }

      trace.appendChild(elem)

      ++index
    }
    container.appendChild(trace)

    // Mount
    document.body.appendChild(overlayReference = overlay)
    errorCache = error
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
    else if (key === '+' || key === '=' || keyCode === 187 || which === 187) toggleInternal()
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
})()
