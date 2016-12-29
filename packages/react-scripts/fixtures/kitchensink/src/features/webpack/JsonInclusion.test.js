import React from 'react';
import ReactDOM from 'react-dom';
import JsonInclusion from './JsonInclusion';

describe('JSON inclusion', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<JsonInclusion />, div);
  });
});
