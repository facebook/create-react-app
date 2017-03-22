import React from 'react';
import ReactDOM from 'react-dom';
import __component__ from './__component__';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<__component__ />, div);
});
