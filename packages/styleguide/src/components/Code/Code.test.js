import React from 'react';
import { render } from '@testing-library/react';

import Code from '.';

describe('rendering', () => {
  it('Code', () => {
    const { getByText } = render(<Code>Code</Code>);
    expect(getByText('Code')).toBeInTheDocument();
  });
});
