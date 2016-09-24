import React, {Component} from 'react';
import logo from './logo.svg';

//styles
import './App.less';
import './App.scss';
import styles from './Modules.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo"/>
          <h2 className="App-title"> ☢ Customizable create-react-app ☢ </h2>
        </div>

        <div className={styles.description}>
          <p> If you want to enable certain features just modify the .env file in the root directory of this
              project.
          </p>

          <b> Styling </b>
          <ul className="configs style-configs">
            <li>
              <code>REACT_APP_SASS=true</code>
              <span>- Enable SASS</span>
            </li>
            <li>
              <code>REACT_APP_LESS=true</code>
              <span>- Enable LESS</span>
            </li>
            <li>
              <code>REACT_APP_CSS_MODULES=true</code>
              <span>- Enable CSS modules </span>
            </li>
          </ul>

          <b> ⚠️ Babel </b>

          <div className={styles.warning}>
            (Please note that these features are highly experimental (especially stage-0) and still not a part of the ES
            specification. <br/>
            Use them at
            your own risk of breaking backwards compatibility if they don't make the final version of the spec.)
          </div>

          <ul className="configs babel-configs">
            <li>
              <code>REACT_APP_BABEL_STAGE_0=true</code>
              <span>- Enable stage-0 preset</span>
            </li>
            <li>
              <code>REACT_APP_DECORATORS=true</code>
              <span>- Enable usage of decorators</span>
            </li>
          </ul>

          <b> Webpack </b>
          <ul className="configs babel-configs">
            <li>
              <code>REACT_APP_WEBPACK_DASHBOARD=true</code>
              <span>- Enable webpack-dashboard ⚠️ (this will turn off the original create-react-app message logs)</span>
            </li>
            <li>
              <code>REACT_APP_DECORATORS=true</code>
              <span>- Enable usage of decorators</span>
            </li>
          </ul>
        </div>
      </div>
    )
  }
}

export default App;
