(function() {
  const ErrorStackParser = require('error-stack-parser')

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
    'white-space': 'pre-wrap'
  }

  const headerStyle = {
    'font-size': 'larger',
    'font-weight': 'bold'
  }

  const traceStyle = {
    'font-size': '1rem'
  }

  function applyStyles(element, styles) {
    element.setAttribute('style', '')
    for (const key in styles) {
      if (!styles.hasOwnProperty(key)) continue
      element.style[key] = styles[key].toString()
    }
  }

  let overlayReference = null

  function render(name, message, frames) {
    if (overlayReference !== null) unmount()
    // Create container
    const overlay = document.createElement('div')
    applyStyles(overlay, overlayStyle)

    // Create header
    const header = document.createElement('div')
    applyStyles(header, headerStyle)
    header.appendChild(document.createTextNode(`${name}: ${message}`))
    overlay.appendChild(header)

    // Show trace
    const trace = document.createElement('div')
    applyStyles(trace, traceStyle)
    for (const frame of frames) {
      const { source } = frame
      const elem = document.createElement('div')
      elem.appendChild(document.createTextNode(source))
      trace.appendChild(elem)
    }
    overlay.appendChild(trace)

    // Mount
    document.body.appendChild(overlayReference = overlay)
  }

  function unmount() {
    if (overlayReference === null) return
    document.body.removeChild(overlayReference)
    overlayReference = null
  }

  function crash(error) {
    let frames = []
    try {
      frames = ErrorStackParser.parse(error)
    } catch (e) {
    }
    render(error.name, error.message, frames)
  }

  window.onerror = function(messageOrEvent, source, lineno, colno, error) {
    if (error == null || !(error instanceof Error) || messageOrEvent.indexOf('Script error') !== -1) {
      crash(new Error('Unknown script error.'))// TODO: more helpful message
    } else {
      crash(error)
    }
  }

  if (module.hot) {
    module.hot.dispose(function() {
      unmount()
    })
  }
})()
