import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter } from 'react-router-dom'
import { Switch, Route } from 'react-router-dom';
import Home from './Components/Home';
import HomeTwo from './Components/Home2';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
      <div className="App">
        <header className="App-header">
        <Switch>
        <Route exact path="/Dummy" component={Home} />
        <Route exact path="/" component={HomeTwo} />
      </Switch>
        </header>
      </div>
      </BrowserRouter>
    );
  }
}

export default App;
