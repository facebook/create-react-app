import React from 'react';
import { render } from '@testing-library/react';

import Sidebar from '.';

describe('rendering', () => {
  it('Sidebar', () => {
    const { getByText } = render(<Sidebar>Sidebar</Sidebar>);
    expect(getByText('Sidebar')).toBeInTheDocument();
  });
});
