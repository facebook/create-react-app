import React from 'react';
import ReactDOM from 'react-dom';

describe('promises', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    return import('./Promises').then(({ default: Promises }) => {
      return new Promise(resolve => {
        ReactDOM.render(<Promises onReady={resolve} />, div);
      });
    });
  });
});
