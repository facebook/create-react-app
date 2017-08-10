import React, { Component } from 'react';
import logo from './logo.svg';

//components
import Emoji from './Emoji';

//styles
import './App.scss';
import './App.less';
import './App.styl';

//modules
import cssStyles from './First.module.css';
import sassStyles from './Second.module.scss';
import lessStyles from './Third.module.less';
import stylusStyles from './Fourth.module.styl';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className={cssStyles.header}>
          <img src={logo} className="App-logo" alt="logo" />
          <h2 className="App-title">
            <Emoji label="danger" emoji="☢" />
            <span> custom-react-scripts </span>
            <Emoji label="danger" emoji="☢" />
          </h2>
          <div className="App-subtitle">
            allow custom config for create-react-app without ejecting
          </div>
        </div>

        <div className={stylusStyles.description}>
          <div className={sassStyles.command}>
            <code>
              create-react-app my-app --scripts-version custom-react-scripts
            </code>
          </div>

          <p>
            If you want to enable/disable certain features just modify the
            <b> .env</b> file in the root directory of the project.
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
            <li>
              <code>REACT_APP_SASS_MODULES=true</code>
              <span>- Enable Sass modules </span>
            </li>
            <li>
              <code>REACT_APP_SASS_MODULES=true</code>
              <span>- Enable Stylus modules </span>
            </li>
            <li>
              <code>REACT_APP_SASS_MODULES=true</code>
              <span>- Enable Less modules </span>
            </li>
          </ul>

          <b>Babel</b>

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
          </ul>

          <br />
          <br />
          <a
            target="_blank"
            rel="noopener noreferrer"
            className={lessStyles.readmeLink}
            href="https://github.com/kitze/create-react-app/tree/master/packages/react-scripts"
          >
            Link to full README.md
          </a>
        </div>
      </div>
    );
  }
}

export default App;
