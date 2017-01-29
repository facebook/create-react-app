import React from 'react';
import ReactDOM from 'react-dom';
import ComputedProperties from './ComputedProperties';

describe('computed properties', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<ComputedProperties />, div);
  });
});
