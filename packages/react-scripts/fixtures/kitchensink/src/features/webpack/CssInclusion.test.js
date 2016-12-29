import React from 'react';
import ReactDOM from 'react-dom';
import CssInclusion from './CssInclusion';

describe('css inclusion', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<CssInclusion />, div);
  });
});
