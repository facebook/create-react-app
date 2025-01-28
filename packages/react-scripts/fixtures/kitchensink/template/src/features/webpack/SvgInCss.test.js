import React from 'react';
import SvgInCss from './SvgInCss';
import ReactDOMClient from 'react-dom/client';

describe('svg in css', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOMClient.createRoot(div).render(<SvgInCss />);
  });
});
