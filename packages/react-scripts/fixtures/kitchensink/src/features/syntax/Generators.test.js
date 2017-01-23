import React from 'react';
import ReactDOM from 'react-dom';
import Generators from './Generators';

describe('generators', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Generators />, div);
  });
});
