import React from 'react';
import PropTypes from 'prop-types';
import Greeting from './Greeting';

class App extends React.Component {
  static propTypes = {
    dpapp: PropTypes.object.isRequired,
  };

  state = {
    me: null,
  };

  componentDidMount() {
    const { dpapp } = this.props;
    dpapp.context.getMe().then(me => this.setState({ me }));
  }

  render() {
    return <Greeting {...this.state} />;
  }
}

export default App;
