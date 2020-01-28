import React from 'react';
import { render } from '@testing-library/react';

import Button from '.';

describe('rendering', () => {
  it('Button', () => {
    const { getByRole } = render(<Button>Button</Button>);
    expect(getByRole('button')).toBeInTheDocument();
  });
});
