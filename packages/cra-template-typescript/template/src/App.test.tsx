import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders welcome heading', () => {
  const { getByRole } = render(<App />);
  const headingElement = getByRole('heading');
  expect(headingElement).toHaveTextContent(/welcome/i);
});
