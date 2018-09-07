import React from 'react'
import ReactDOM from 'react-dom'

import App from './core/App'
import './index.css'
import registerServiceWorker from './registerServiceWorker'

ReactDOM.render(<App />, document.getElementById('root'))
registerServiceWorker()

if (module.hot) {
  module.hot.accept('./core/App', () => {
    ReactDOM.render(<App />, document.getElementById('root'))
  })
}