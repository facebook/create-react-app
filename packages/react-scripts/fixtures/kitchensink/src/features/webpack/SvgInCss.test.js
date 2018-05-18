import React from 'react';
import ReactDOM from 'react-dom';
import SvgInCss from './SvgInCss';

describe('svg in css', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<SvgInCss />, div);
  });
});
