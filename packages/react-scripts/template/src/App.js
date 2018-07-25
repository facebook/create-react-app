import React from 'react';
import PropTypes from 'prop-types';
import { AppFrame } from '@deskpro/apps-sdk-react';
import icon from './icon.png';

class App extends React.Component {
  static propTypes = {
    dpapp: PropTypes.object.isRequired,
  };

  render() {
    const { dpapp } = this.props;
    return (
      <AppFrame iconUrl={icon} title={dpapp.manifest.title}>
        <h1>Hi</h1>
      </AppFrame>
    );
  }
}

export default App;
