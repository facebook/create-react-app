import React from 'react';
import logo from './logo.svg';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.app}>
      <header className={styles.appHeader}>
        <img src={logo} className={styles.appLogo} alt="logo" />
        <p>
          Edit <code>src/Components/App.jsx</code> and save to reload.
        </p>
        <a
          className={styles.appLink}
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Frontier
        </a>
      </header>
    </div>
  );
}

export default App;
