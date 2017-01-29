import React from 'react';
import ReactDOM from 'react-dom';
import ClassProperties from './ClassProperties';

describe('class properties', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<ClassProperties />, div);
  });
});
