import React from 'react'
import ReactDOM from 'react-dom'
import App from 'App'
// react-hot-loader is bundled with `@trunkclub/react-scripts`
import { AppContainer } from '@trunkclub/react-scripts/node_modules/react-hot-loader'
import 'index.css'

// AppContainer is used by react-hot-loader, in production it is
// a straight pass through so everything can stay just like this.
//
// Put the root of the app as children to `AppContainer` here and
// also below in the `if (module.hot) { ... }` section.
ReactDOM.render(
  <AppContainer>
    <App/>
  </AppContainer>,
  document.getElementById('root')
)

// With `react-hot-loader@3` we have to setup the hot module
// replacement manually.
if (module.hot) {
  module.hot.accept('App', () => {
    ReactDOM.render(
      <AppContainer>
        {React.createElement(require('App').default)}
      </AppContainer>,
      document.getElementById('root')
    )
  })
}
