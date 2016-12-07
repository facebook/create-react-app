// @flow
import React, { Component } from 'react';
// testing absolute imports using NODE_PATH=src
import CommentsList from 'CommentsList';
import UsersList from 'UsersList';
import logo from './logo.svg';
import './App.css';
import EnvVariableMessages from './EnvVariableMessages';
import { abstract } from './abstract.json';
import verySmallImage from './1x1-img.jpg';
import aFileWithoutExt from './aFileWithoutExt';
import aFileWithUnknownExt from './aFileWithExt.unknown'
import aDeepJsModule from './subfolder/lol'

class App extends Component {
  render() {
    const templateName : string = "Kitchen Sink"
    return (
      <div className="App">
        <div className="App-header">
          <img id="svg-import" src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to the {templateName} Template</h2>
        </div>

        <details>
          <summary>
            {abstract}
          </summary>

          <p className="App-intro">
            To get started, edit <code>src/App.js</code> and save to reload.
          </p>
        </details>

        <img id="img-import" src={verySmallImage} alt="a very small cat" />

        <span id="no-ext-import">{aFileWithoutExt}</span>
        <span id="unknown-ext-import">{aFileWithUnknownExt}</span>
        <span id="subfolder-js-import">{aDeepJsModule()} {aDeepJsModule.toString()}</span>

        <EnvVariableMessages />
        <UsersList />
        <CommentsList user="User 1" />
      </div>
    );
  }
}

export default App;
