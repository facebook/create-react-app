// @flow

import React from 'react';

import styles from './App.css';
import Header from './containers/header';

import logo from './assets/logo.svg';

const App = () => (
  <div className={styles.app}>
    <Header logo={logo} />
    <p className={styles.appIntro}>
      To get started, edit <code>src/App.jsx</code> and save to reload.
    </p>
  </div>
);

export default App;
