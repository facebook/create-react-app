import React from 'react';
import ReactDOM from 'react-dom';
import ComputedProperties from './ComputedProperties';

describe('computed properties', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    return new Promise(resolve => {
      ReactDOM.render(<ComputedProperties onReady={resolve} />, div);
    });
  });
});
