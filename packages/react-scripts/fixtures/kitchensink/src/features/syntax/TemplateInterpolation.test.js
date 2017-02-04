import React from 'react';
import ReactDOM from 'react-dom';
import TemplateInterpolation from './TemplateInterpolation';

describe('template interpolation', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    return new Promise(resolve => {
      ReactDOM.render(<TemplateInterpolation onReady={resolve} />, div);
    });
  });
});
