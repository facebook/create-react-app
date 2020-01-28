import React from 'react';
import { render } from '@testing-library/react';

import Icon from '.';

describe('rendering', () => {
  it('Icon', () => {
    const { getByTitle } = render(<Icon name="dummy" />);
    expect(getByTitle('dummy')).toBeInTheDocument();
  });
});
