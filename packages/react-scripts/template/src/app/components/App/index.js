import React, { Component } from 'react';

import logo from '../../../logo.svg';

import style from './styles.scss';

class App extends Component {
  render() {
    return (
      <div className={style.app}>
        <header className={style.appHeader}>
          <img src={logo} className={style.appLogo} alt="logo" />
          <h1 className={style.appTitle}>Welcome to React</h1>
        </header>
        <p className={style.appIntro}>
          To get started, edit <code>src/app/components/App/index.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
