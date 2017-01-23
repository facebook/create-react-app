import React from 'react';
import ReactDOM from 'react-dom';
import NodePath from './NodePath';

describe('NODE_PATH', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<NodePath />, div);
  });
});
