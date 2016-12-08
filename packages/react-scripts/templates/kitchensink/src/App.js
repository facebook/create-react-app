// @flow
import React from 'react';

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = { feature: null }
  }

  componentDidMount() {
    switch (location.hash.slice(1)) {
      case 'promises':
        require.ensure(['./features/Promises'], () => {
          this.setState({ feature: require('./features/Promises').default })
        });
        break;
      case 'generators':
        require.ensure(['./features/Generators'], () => {
          this.setState({ feature: require('./features/Generators').default })
        });
        break;
      case 'async-await':
        require.ensure(['./features/AsyncAwait'], () => {
          this.setState({ feature: require('./features/AsyncAwait').default })
        });
        break;
      default:
        this.setState({ feature: null });
        break;
    }
  }

  render() {
    const Feature = this.state.feature;
    return Feature ? <Feature /> : null;
  }
}

export default App;
