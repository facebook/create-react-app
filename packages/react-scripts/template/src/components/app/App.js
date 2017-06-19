import React from 'react';
import PropTypes from 'prop-types';
import logo from './logo.svg';
import Hello from 'components/Hello';
import './App.scss';

export default class App extends React.PureComponent {
  static propTypes = {
    onSubmitHello: PropTypes.func.isRequired,
    greeting: PropTypes.string,
  }

  render() {
    const {
      greeting,
      onSubmitHello,
    } = this.props;

    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>{greeting || 'Welcome to ServiceMax!'}</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/components/app/App.js</code> and save to reload.
        </p>
        <div className="App-hello">
          <Hello onSubmit={onSubmitHello} />
        </div>
      </div>
    );
  }
}
