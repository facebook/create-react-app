import React from 'react';
import ReactDOM from 'react-dom';
import ObjectSpread from './ObjectSpread';

describe('object spread', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    return new Promise(resolve => {
      ReactDOM.render(<ObjectSpread onReady={resolve} />, div);
    });
  });
});
