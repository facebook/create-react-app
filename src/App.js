import React from 'react';
import './App.css';
import logo from './logo.png';

export default function App() {
  return (
    <div>
      <h1>
        Welcome to
        <img src={logo} className="App--logo" alt="React logo" />
        React
      </h1>
      <p>
        To get started, edit <code>src/App.js</code> and
        save the file to update.
      </p>
    </div>
  );
}
