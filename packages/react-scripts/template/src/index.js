import React from 'react'
import ReactDOM from 'react-dom'
import Root from '@fs/zion-root'
import { addTranslations } from '@fs/zion-locale'
import { Router } from '@fs/zion-router'
import App from './App'
import * as serviceWorker from './serviceWorker'
import translations from './locales'

// Helps with updating translations after they are loaded.
addTranslations(translations)

// This sets up the base URL whether you are running your app locally
// or live.
const base = window.SERVER_DATA ? new URL(window.SERVER_DATA.appPath).pathname : ''

// This is abstracted from the render method to improve readability
const FrontierRoot = () => (
  // Root provides the global Frontier-react things you need
  <Root>
    <Router basename={base}>
      <App />
    </Router>
  </Root>
)

// Attach the FronteirRoot component to the DOM
ReactDOM.render(<FrontierRoot />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
