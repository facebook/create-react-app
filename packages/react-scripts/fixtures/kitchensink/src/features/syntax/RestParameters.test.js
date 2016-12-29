import React from 'react';
import ReactDOM from 'react-dom';
import RestParameters from './RestParameters';

describe('rest parameters', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<RestParameters />, div);
  });
});
