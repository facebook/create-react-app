(function() {
  const StackTraceResolve = require('stacktrace-resolve').default

  const CONTEXT_SIZE = 4

  const overlayStyle = {
    position: 'fixed',
    'box-sizing': 'border-box',
    top: '0px', left: '0px',
    bottom: '0px', right: '0px',
    width: '100vw', height: '100vh',
    'background-color': 'rgb(150, 0, 0)',
    padding: '2rem',
    'z-index': 1337,
    'font-family': 'Menlo, Consolas, monospace',
    color: 'rgb(232, 232, 232)',
    'white-space': 'pre-wrap',
    overflow: 'auto'
  }

  const exitStyle = {
    position: 'fixed',
    top: '1em',
    right: '1em',
    'font-size': '0.8em'
  }

  const headerStyle = {
    'font-size': '1.5em',
    'font-weight': 'bold'
  }

  const functionNameStyle = {
    'margin-top': '1em',
    'font-size': '1.2em'
  }

  const linkStyle = {
    'font-size': '0.8em'
  }

  const anchorStyle = {
    'text-decoration': 'none',
    color: 'rgba(255, 255, 255, 0.6)'
  }

  const traceStyle = {
    'font-size': '1rem'
  }

  const depStyle = {
    'font-size': '1em',
    color: 'rgba(255, 255, 255, 0.6)'
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
  let additionalCount = 0

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

  function render(name, message, resolvedFrames) {
    if (overlayReference !== null) {
      renderAdditional()
      return
    }
    // Create container
    const overlay = document.createElement('div')
    applyStyles(overlay, overlayStyle)

    const exit = document.createElement('div')
    exit.appendChild(document.createTextNode('press [escape] to close this prompt'))
    applyStyles(exit, exitStyle)
    overlay.appendChild(exit)

    // Create header
    const header = document.createElement('div')
    applyStyles(header, headerStyle)
    header.appendChild(document.createTextNode(`${name}: ${message}`))
    overlay.appendChild(header)

    // Show trace
    const trace = document.createElement('div')
    applyStyles(trace, traceStyle)
    // Firefox can't handle const due to non-compliant implementation
    // Revisit Jan 2016
    // https://developer.mozilla.org/en-US/Firefox/Releases/51#JavaScript
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1101653
    let index = 0
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
        for (let line of sourceLines) {
          const { context, text, line: fileLine } = line
          let modSource = (Array(11).join(' ') + fileLine).slice(-6) + (context ? '   | ' : ' > | ')
          modSource += text
          const lineElem = document.createElement('div')
          lineElem.appendChild(document.createTextNode(modSource))
          pre.appendChild(lineElem)
        }
        elem.appendChild(pre)
      }

      trace.appendChild(elem)

      ++index
    }
    overlay.appendChild(trace)

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
    StackTraceResolve(error, CONTEXT_SIZE).then(function(resolvedFrames) {
      if (unhandledRejection) {
        render(`Unhandled Rejection (${error.name})`, error.message, resolvedFrames)
      } else {
        render(error.name, error.message, resolvedFrames)
      }
    }).catch(function(e) {
      // This is another fail case (unlikely to happen)
      // e.g. render(...) throws an error with provided arguments
      console.log('Red box renderer error:', e)
      render('Error', 'Unknown Error (failure to materialize)', [])
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
})()
