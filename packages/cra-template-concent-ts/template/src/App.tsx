import React from 'react';
import logo from './logo.svg';
import { Counter } from 'features/counter/Counter';
import { CounterTip } from 'features/counter/CounterTip';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Counter />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <span>
          <span>Learn </span>
          <a
            className="App-link"
            href="https://reactjs.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            React
          </a>
          <span>, </span>
          <a
            className="App-link"
            href="https://github.com/concentjs/concent"
            target="_blank"
            rel="noopener noreferrer"
          >
            Concent
          </a>
        </span>
        <CounterTip />
      </header>
    </div>
  );
}

export default App;
