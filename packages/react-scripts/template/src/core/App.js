import React, { Component } from 'react'
import { Provider } from 'mobx-react'

import Routes from './routes'
import Stores from './stores'

class App extends Component {
  render() {
    return (
      <div>
        <Provider {...Stores}>
          <Routes />
        </Provider>
      </div>
    )
  }
}

export default App
