import React from 'react';
import ReactDOM from 'react-dom';
import UnknownExtInclusion from './UnknownExtInclusion';

describe('unknown ext inclusion', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<UnknownExtInclusion />, div);
  });
});
