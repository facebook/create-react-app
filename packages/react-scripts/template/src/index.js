import React from 'react'
import ReactDOM from 'react-dom'
import Root from '@fs/zion-root'
import { addTranslations } from '@fs/zion-locale'
import { Router } from '@fs/zion-router'
import App from './App'
import * as serviceWorker from './serviceWorker'
import translations from './locales'

// For details about loading translations: https://www.familysearch.org/frontier/docs/develop/i18n
addTranslations(translations)

// This is where you pass data from the server to the client using the SERVER_DATA global.
// Here we pass the mounted app path from the server to the client.
const base = window.SERVER_DATA ? new URL(window.SERVER_DATA.appPath).pathname : ''

const FrontierRoot = () => (
  <Root>
    <Router basename={base}>
      <App />
    </Router>
  </Root>
)

ReactDOM.render(<FrontierRoot />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
