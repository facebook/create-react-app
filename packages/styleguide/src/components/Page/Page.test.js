import React from 'react';
import { render } from '@testing-library/react';

import Page from '.';

describe('rendering', () => {
  it('Page', () => {
    const { getByText } = render(<Page render={() => 'Page'} />);
    expect(getByText('Page')).toBeInTheDocument();
  });
});
