import React from 'react';
import ReactDOM from 'react-dom';
import ArrayDestructuring from './ArrayDestructuring';

describe('array destructuring', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<ArrayDestructuring />, div);
  });
});
