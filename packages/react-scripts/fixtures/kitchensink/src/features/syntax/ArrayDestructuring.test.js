import React from 'react';
import ReactDOM from 'react-dom';
import ArrayDestructuring from './ArrayDestructuring';

describe('array destructuring', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    return new Promise(resolve => {
      ReactDOM.render(<ArrayDestructuring onReady={resolve} />, div);
    });
  });
});
