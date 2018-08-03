import React from 'react';
import PropTypes from 'prop-types';

class App extends React.Component {
  static propTypes = {
    dpapp: PropTypes.object.isRequired,
  };

  render() {
    const { dpapp } = this.props;
    return <h1>Hi</h1>;
  }
}

export default App;
