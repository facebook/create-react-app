import React from 'react'
import ReactDOM from 'react-dom'
import App from 'App'
import { AppContainer } from '@trunkclub/react-scripts/node_modules/react-hot-loader'
import 'index.css'

ReactDOM.render(
  <AppContainer>
    <App/>
  </AppContainer>,
  document.getElementById('root')
)

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
