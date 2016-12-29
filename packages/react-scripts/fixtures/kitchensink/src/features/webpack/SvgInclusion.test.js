import React from 'react';
import ReactDOM from 'react-dom';
import SvgInclusion from './SvgInclusion';

describe('svg inclusion', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<SvgInclusion />, div);
  });
});
