import React from 'react';
import comatchLogo from 'static/comatch-header-logo.png';

export default () => (
  <div className="ComatchMVP">
    <header className="ComatchMVP-header">
      <img src={comatchLogo} className="ComatchMVP-logo" alt="logo" />
      <a
        className="ComatchMVP-link"
        href="https://reactjs.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn React
      </a>
    </header>
  </div>
);
