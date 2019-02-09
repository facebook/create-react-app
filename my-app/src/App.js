import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter } from 'react-router-dom'
import { Switch, Route } from 'react-router-dom';
import Card from './Components/Card';
import Home from './Components/Home';
import UserProfile from './Components/UserProfile';
class App extends Component {
  render() {
    return (
      <BrowserRouter>
      <div className="App">
        <header className="App-header">
        <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/ChosenCard/getMatchup" component={Card} />
        <Route path = "/userProfile" component = {UserProfile} />
      </Switch>
        </header>
      </div>
      </BrowserRouter>
    );
  }
}

export default App;
