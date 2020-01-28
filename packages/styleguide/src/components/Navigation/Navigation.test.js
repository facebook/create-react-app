import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import Navigation from '.';

describe('rendering', () => {
  it('Navigation', () => {
    const { getByRole } = render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );
    expect(getByRole('navigation')).toBeInTheDocument();
  });
});
