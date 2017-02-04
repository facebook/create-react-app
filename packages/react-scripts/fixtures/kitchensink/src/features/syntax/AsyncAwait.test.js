import React from 'react';
import ReactDOM from 'react-dom';
import AsyncAwait from './AsyncAwait';

describe('async/await', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<AsyncAwait />, div);
  });
});
