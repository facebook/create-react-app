import React from 'react';
import ReactDOM from 'react-dom';
import DestructuringAndAwait from './DestructuringAndAwait';

describe('destructuring and await', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<DestructuringAndAwait />, div);
  });
});
