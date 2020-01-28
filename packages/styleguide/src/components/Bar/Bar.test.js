import React from 'react';
import { render } from '@testing-library/react';

import { Bar, BarItem } from '.';

describe('rendering', () => {
  it('Bar', () => {
    const { getByText } = render(<Bar>Bar</Bar>);
    expect(getByText('Bar')).toBeInTheDocument();
  });

  it('BarItem', () => {
    const { getByText } = render(<BarItem>BarItem</BarItem>);
    expect(getByText('BarItem')).toBeInTheDocument();
  });
});
