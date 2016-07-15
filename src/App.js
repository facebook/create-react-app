import React from 'react';
import './App.css';
import reactImage from './react.png';

export default function App() {
  return (
    <div className="App">
      Hello world!
      <img src={reactImage} alt="React rocks!" />
    </div>
  );
}
