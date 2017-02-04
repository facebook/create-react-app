import React from 'react';
import ReactDOM from 'react-dom';
import ArraySpread from './ArraySpread';

describe('array spread', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    return new Promise(resolve => {
      ReactDOM.render(<ArraySpread onReady={resolve} />, div);
    });
  });
});
