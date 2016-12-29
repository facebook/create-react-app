import React from 'react';
import ReactDOM from 'react-dom';
import Promises from './Promises';

describe('promises', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Promises />, div);
  });
});
