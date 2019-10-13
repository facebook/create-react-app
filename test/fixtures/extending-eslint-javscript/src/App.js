import React, { Component } from 'react';

class App extends Component {
  // Should cause the build to fail due to extended eslint rule change
  constructor(props) {
    super(props);
  }

  render() {
    return <div>Hello</div>;
  }
}

export default App;
