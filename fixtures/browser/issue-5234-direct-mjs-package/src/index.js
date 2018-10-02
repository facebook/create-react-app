import React from 'react';
import ReactDOM from 'react-dom';
import graphql, { parse } from 'graphql';
import test from './Test.mjs';

class App extends React.Component {
  state = { ready: false };
  async componentDidMount() {
    document.testData = { graphql: typeof graphql, parse: typeof parse, test };
    this.setState({ ready: true });
  }
  render() {
    return this.state.ready ? <div className="App-Ready" /> : null;
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
