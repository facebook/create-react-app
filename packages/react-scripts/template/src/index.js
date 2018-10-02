import React from 'react'
import ReactDOM from 'react-dom'
import registerServiceWorker from 'rmw-shell/lib/utils/registerServiceWorker'
import App, { MainAsync } from './App'

ReactDOM.render(<App />, document.getElementById('root'), () => {
  setTimeout(() => {
    MainAsync.preload()
  }, 1500)
})

registerServiceWorker()
