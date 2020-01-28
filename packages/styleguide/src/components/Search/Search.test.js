import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import Search from '.';

describe('rendering', () => {
  it('Search', () => {
    const { getByRole } = render(
      <BrowserRouter>
        <Search list={['lol']} />
      </BrowserRouter>
    );
    expect(getByRole('combobox')).toBeInTheDocument();
  });
});
