import React, {Component} from 'react';
import logo from './logo.svg';

//styles
import './App.less';
import './App.scss';
import './App.styl';
import styles from './Modules.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo"/>
          <h2 className="App-title"> ☢ custom-react-scripts ☢ </h2>
          <div className="App-subtitle"> allow custom config for create-react-app without ejecting</div>
        </div>

        <div className={styles.description}>

          <div className={styles.command}>
            <code>create-react-app my-app --scripts-version custom-react-scripts</code>
          </div>

          <p> If you want to enable/disable certain features just modify the <b>.env</b> file in the root directory of
              the
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
              <code>REACT_APP_STYLUS=true</code>
              <span>- Enable Stylus</span>
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

          <b> Others </b>
          <ul className="configs style-configs">
            <li>
              <code>PORT=3015</code>
              <span>- change default port (supported in CRA by default)</span>
            </li>
            <li>
              <code>OPEN_BROWSER=false</code>
              <span>- don't open browser after running webpack server</span>
            </li>
          </ul>

          <br/>
          <br/>
          <a target="_blank" className={styles.readmeLink} href="https://github.com/kitze/create-react-app/tree/master/packages/react-scripts">
            Link to full README.md
          </a>
        </div>
      </div>
    )
  }
}

export default App;
