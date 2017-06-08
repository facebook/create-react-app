import React, { Component } from 'react';
import logo from './logo.svg';
import style from './App.css';
import 'vtex-tachyons';

class App extends Component {
  render() {
    return (
      <div className={style.app}>
        <img src={logo} className={style.appLogo} alt="logo" />
        <h2>Welcome to VTEX</h2>
        <p className={style.appIntro}>
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
