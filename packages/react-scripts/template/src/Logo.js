import React from 'react';
import logo from './logo.svg';

export default function Logo(props) {
  return (
    <div className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <h2>Welcome to React!</h2>
      {props.children}
    </div>
  );
}
