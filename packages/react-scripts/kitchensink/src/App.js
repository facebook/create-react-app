// @flow
import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import EnvVariableMessages from './EnvVariableMessages';
// testing absolute imports using NODE_PATH=src
import CommentsList from 'CommentsList';
import UsersList from 'UsersList';

class App extends Component {
  render() {
    const templateName : string = "Kitchen Sink"
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to the {templateName} Template</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <EnvVariableMessages />
        <UsersList />
        <CommentsList user="User 1" />
      </div>
    );
  }
}

export default App;
