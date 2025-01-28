import React from 'react';
import SvgInCss from './SvgInCss';
import ReactDOMClient from 'react-dom/client';
import { flushSync } from 'react-dom';

describe('svg in css', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    flushSync(() => {
      ReactDOMClient.createRoot(div).render(<SvgInCss />);
    });
  });
});
