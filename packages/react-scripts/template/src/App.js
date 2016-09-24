import React, {Component} from 'react';
import logo from './logo.svg';

//styles
import './App.less';
import './App.scss';
import styles from './Modules.css';

//mobx
import {observer} from 'mobx-react';

@observer
class App extends Component {
  render() {

    const {app} = this.props.store;

    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo"/>
          <h2 className="App-title">{app.title} </h2>
          <button className="App-button" onClick={::app.changeRandomTitle}>
            change me
          </button>
        </div>
        <p className={styles.appIntro}>
          To get started, edit <code className={styles.code}>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
