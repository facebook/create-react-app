import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders welcome heading', () => {
  const { getByRole } = render(<App />);
  const linkElement = getByRole('link');
  expect(linkElement).toHaveTextContent(/learn react/i);
});
