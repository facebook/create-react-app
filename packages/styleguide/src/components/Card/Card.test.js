import React from 'react';
import { render } from '@testing-library/react';

import Card from '.';

describe('rendering', () => {
  it('Card', () => {
    const { getByText } = render(<Card>Card</Card>);
    expect(getByText('Card')).toBeInTheDocument();
  });
});
