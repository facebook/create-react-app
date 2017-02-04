import React from 'react';
import ReactDOM from 'react-dom';
import ObjectSpread from './ObjectSpread';

describe('object spread', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<ObjectSpread />, div);
  });
});
