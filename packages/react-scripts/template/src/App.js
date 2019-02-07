import React, { Component } from 'react'
import logo from './swrve-logo.png'
class App extends Component {
  render() {
    return (
      <div>
        <header className="header">
          <img src={logo} className="logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a href="https://ui-components.swrve.com" target="_blank" rel="noopener noreferrer">
            ui-components
          </a>
        </header>
      </div>
    )
  }
}

export default App
