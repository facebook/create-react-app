import React from 'react';
import ReactDOM from 'react-dom';
import App from '__ROOT__/src/App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});
