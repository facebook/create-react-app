import React, { Component } from 'react';

class App extends Component {
  state = {};
  componentDidMount() {
    import('./hello_world_bg.wasm').then(helloWorld => {
      this.setState({ answer: helloWorld.add(21, 21) });
    });
  }
  render() {
    const { answer } = this.state;
    return answer ? (
      <div className="wasm-result">Ultimate answer: {answer}</div>
    ) : null;
  }
}

export default App;
