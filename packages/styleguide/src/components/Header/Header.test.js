import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import Header from '.';

describe('rendering', () => {
  it('Header', () => {
    const { getByRole } = render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    expect(getByRole('link')).toBeInTheDocument();
  });
});
