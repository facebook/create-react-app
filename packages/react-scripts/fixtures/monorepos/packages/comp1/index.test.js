import React from 'react';
import ReactDOM from 'react-dom';
import Comp1 from '.';

it('renders Comp1 without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Comp1 />, div);
});
