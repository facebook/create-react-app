import React from 'react';
import ReactDOM from 'react-dom';
import ShellEnvVariables from './ShellEnvVariables';

describe('shell env variables', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<ShellEnvVariables />, div);
  });
});
