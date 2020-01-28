import React from 'react';
import { render } from '@testing-library/react';

import Preview from '.';

describe('rendering', () => {
  it('Preview', () => {
    const { getByText } = render(<Preview>Preview</Preview>);
    expect(getByText('Preview')).toBeInTheDocument();
  });
});
