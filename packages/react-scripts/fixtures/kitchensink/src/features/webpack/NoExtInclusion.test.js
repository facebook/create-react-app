import React from 'react';
import ReactDOM from 'react-dom';
import NoExtInclusion from './NoExtInclusion';

describe('no ext inclusion', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<NoExtInclusion />, div);
  });
});
