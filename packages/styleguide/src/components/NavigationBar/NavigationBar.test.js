import React from 'react';
import { render } from '@testing-library/react';

import NavigationBar from '.';

describe('rendering', () => {
  it('NavigationBar', () => {
    const { getByRole } = render(<NavigationBar />);
    expect(getByRole('button')).toBeInTheDocument();
  });
});
