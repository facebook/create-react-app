import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Bad from './fold/Bad';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <div>
            <div>
              <div>
                <div>
                  <div>
                    <div>
                      <img src={logo} className="App-logo" alt="logo" />
                      <Bad>Welcome to React</Bad>
                      {[1, 2, 3].map(s => <span>{s}</span>)}
                    </div>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
          </div>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
