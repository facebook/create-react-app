import React from 'react';
import ReactDOM from 'react-dom';
import FileEnvVariables from './FileEnvVariables';

describe('.env variables', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<FileEnvVariables />, div);
  });
});
