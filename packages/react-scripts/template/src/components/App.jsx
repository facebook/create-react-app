import React from 'react';
import logo from './logo.svg';
import {css} from '@emotion/core';
// import styles from './App.module.css';

function App() {
  return (
    <div css={css`text-align: center`} >
      <header className={styles.appHeader}>
        <img src={logo} className={styles.appLogo} alt="logo" />
        <p>
          Edit <code>src/components/App.jsx</code> and save to reload.
        </p>
        <a
          className={styles.appLink}
          href="https://www.familysearch.org/frontier/docs/#/"
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
