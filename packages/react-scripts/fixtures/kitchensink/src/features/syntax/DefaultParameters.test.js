import React from 'react';
import ReactDOM from 'react-dom';
import DefaultParameters from './DefaultParameters';

describe('default parameters', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<DefaultParameters />, div);
  });
});
