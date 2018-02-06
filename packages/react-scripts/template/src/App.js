import React, { Component } from 'react';
import logo from 'logo.svg';
import 'App.css';

async function whatever() {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');

    const data = await response.json();
    return data;
}

async function whatever1() {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');

    const data = await response.json();
    return data;
}

async function whatever2() {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');

    const data = await response.json();
    return data;
}

async function whatever3() {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');

    const data = await response.json();
    return data;
}

async function whatever4() {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');

    const data = await response.json();
    return data;
}

class App extends Component {
    async componentDidMount() {
        console.log(await whatever());
        console.log(await whatever1());
        console.log(await whatever2());
        console.log(await whatever3());
        console.log(await whatever4());
    }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
