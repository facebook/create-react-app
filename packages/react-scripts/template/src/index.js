import React from 'react'
import ReactDOM from 'react-dom'
import * as serviceWorker from 'rmw-shell/lib/utils/serviceWorker'
import App, { MainAsync } from './App'

ReactDOM.render(<App />, document.getElementById('root'), () => {
  setTimeout(() => {
    MainAsync.preload()
  }, 1500)
})

serviceWorker.register()