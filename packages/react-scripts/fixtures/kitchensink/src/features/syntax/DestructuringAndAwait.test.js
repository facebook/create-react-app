import React from 'react';
import ReactDOM from 'react-dom';
import DestructuringAndAwait from './DestructuringAndAwait';

describe('destructuring and await', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    return new Promise(resolve => {
      ReactDOM.render(<DestructuringAndAwait onReady={resolve} />, div);
    });
  });
});
