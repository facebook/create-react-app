import React from 'react';
import Hello from './components/Hello';

export default class App extends React.Component {
  render() {
    return <Hello />;
  }
}

module.hot.accept(['./Hello'], window.__invalidate);
