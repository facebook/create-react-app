import * as React from 'react';

class App extends React.Component {
  render() {
    return <div>{format(123)}</div>;
  }
}

function format(value: string) {
  return value;
}

export default App;
