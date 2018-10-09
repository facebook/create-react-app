import React from 'react';
import { bar } from 'unknown-package';

class App extends React.Component {
  componentDidMount() {
    bar();
  }
  render() {
    return <div />;
  }
}

export default App;
