import React from 'react';
import ReactDOM from 'react-dom';
import TemplateInterpolation from './TemplateInterpolation';

describe('template interpolation', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<TemplateInterpolation />, div);
  });
});
