import React from 'react';
import ReactDOM from 'react-dom';
import ArraySpread from './ArraySpread';

describe('array spread', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<ArraySpread />, div);
  });
});
