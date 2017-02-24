import React from 'react';
import ReactDOM from 'react-dom';
import DefaultParameters from './DefaultParameters';

describe('default parameters', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    return new Promise(resolve => {
      ReactDOM.render(<DefaultParameters onReady={resolve} />, div);
    });
  });
});
