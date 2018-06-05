import React from 'react';
import ReactDOM from 'react-dom';
import Comp2 from '.';

it('renders Comp2 without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Comp2 />, div);
});
