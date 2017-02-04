import React from 'react';
import ReactDOM from 'react-dom';
import CustomInterpolation from './CustomInterpolation';

describe('custom interpolation', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    return new Promise(resolve => {
      ReactDOM.render(<CustomInterpolation onReady={resolve} />, div);
    });
  });
});
