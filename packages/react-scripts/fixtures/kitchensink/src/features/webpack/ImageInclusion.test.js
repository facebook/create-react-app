import React from 'react';
import ReactDOM from 'react-dom';
import ImageInclusion from './ImageInclusion';

describe('image inclusion', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<ImageInclusion />, div);
  });
});
