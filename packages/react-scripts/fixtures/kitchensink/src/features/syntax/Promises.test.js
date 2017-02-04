import React from 'react';
import ReactDOM from 'react-dom';
import Promises from './Promises';

describe('promises', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    return new Promise(resolve => {
      ReactDOM.render(<Promises onReady={resolve} />, div);
    });
  });
});
