import React from 'react';
import ReactDOM from 'react-dom';
import Generators from './Generators';

describe('generators', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    return new Promise(resolve => {
      ReactDOM.render(<Generators onReady={resolve} />, div);
    });
  });
});
