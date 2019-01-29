import React, { Component } from 'react';
import ExampleTimestamp from './ExampleTimestamp';
import logo from './logo.svg';
import styles from './App.module.css';

class App extends Component {
  render() {
    return (
      <div className={styles.app}>
        <header className={styles.appHeader}>
          <img src={logo} className={styles.appLogo} alt="logo" />
          <p>
            Edit <code>src/components/App.jsx</code> and save to reload.
          </p>
          <a
            className={styles.appLink}
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn Frontier
          </a>
          <ExampleTimestamp />
        </header>
      </div>
    );
  }
}

export default App;
