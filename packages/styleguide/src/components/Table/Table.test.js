import React from 'react';
import { render } from '@testing-library/react';

import Table from '.';

const props = {
  columns: [
    { key: 'first', label: 'First' },
    { key: 'second', label: 'Second' },
  ],
  data: [
    {
      first: 'First item in first column',
      second: 'Second item in first column',
    },
    {
      first: 'First item in second column',
      second: 'Second item in second column',
    },
  ],
};

describe('rendering', () => {
  it('Table', () => {
    const { getByText } = render(<Table {...props} />);
    expect(getByText('First item in first column')).toBeInTheDocument();
  });
});
