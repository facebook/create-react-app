(function() {
  const ErrorStackParser = require('error-stack-parser')
  const StackTraceGPS = require('stacktrace-gps')
  const gps = new StackTraceGPS()

  const overlayStyle = {
    position: 'fixed',
    'box-sizing': 'border-box',
    top: '0px', left: '0px',
    bottom: '0px', right: '0px',
    width: '100vw', height: '100vh',
    'background-color': 'rgb(200, 0, 0)',
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
    color: 'rgb(222, 222, 222)'
  }

  const traceStyle = {
    'font-size': '1rem'
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

  function render(name, message, frames) {
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
    for (let frame of frames) {
      const { functionName, fileName, lineNumber } = frame
      const url = `${fileName}:${lineNumber}`

      const elem = document.createElement('div')

      const elemFunctionName = document.createElement('div')
      applyStyles(elemFunctionName, functionNameStyle)
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

      trace.appendChild(elem)
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

  function crash(error, unhandledRejection = false) {
    new Promise(function(resolve, reject) {
      let frames = []

      // Wrap all this up to make sure we have a fail case (external apis) ...
      try {
        // Error -> StackFrame[]
        frames = ErrorStackParser.parse(error)
        if (frames.length === 0) {
          resolve(frames)
          return
        }

        // Resolve StackFrames via sourcemaps and magic
        const frames2 = []
        let pending = frames.length
        frames.forEach(function(frame, index) {
          // Switched from pinpoint due to erratic bugs
          // follow: https://github.com/stacktracejs/stacktrace-gps/issues/46
          gps.getMappedLocation(frame).then(function(nFrame) {
            frames2[index] = nFrame
            if (--pending === 0) resolve(frames2)
          }).catch(function() {
            // Failed to map frame ... reuse old frame.
            frames2[index] = frame
            if (--pending === 0) resolve(frames2)
          })
        })
      } catch (e) {
        // Failed to resolve frames at one point or another (synchronous)
        // Default to using `frames` which should contain the browser's stack
        resolve(frames)
      }
    }).then(function(frames) {
      if (unhandledRejection) {
        render(`Unhandled Rejection (${error.name})`, error.message, frames)
      } else {
        render(error.name, error.message, frames)
      }
    }).catch(function() {
      // This is another fail case (unlikely to happen)
      // e.g. render(...) throws an error with provided arguments
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

  if (module.hot) {
    module.hot.dispose(function() {
      unmount()
      window.removeEventListener('unhandledrejection', promiseHandler)
      window.removeEventListener('keydown', escapeHandler)
    })
  }
})()
