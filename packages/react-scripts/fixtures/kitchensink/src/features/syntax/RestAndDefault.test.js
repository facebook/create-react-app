import React from 'react';
import ReactDOM from 'react-dom';
import RestAndDefault from './RestAndDefault';

describe('rest + default', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<RestAndDefault />, div);
  });
});
