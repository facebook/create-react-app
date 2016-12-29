import React from 'react';
import ReactDOM from 'react-dom';
import ObjectDestructuring from './ObjectDestructuring';

describe('object destructuring', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<ObjectDestructuring />, div);
  });
});
