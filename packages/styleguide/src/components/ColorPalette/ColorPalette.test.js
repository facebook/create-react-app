import React from 'react';
import { render } from '@testing-library/react';

import ColorPallete from '.';

describe('rendering', () => {
  it('ColorPallete', () => {
    const { getByText } = render(
      <ColorPallete
        name="primary"
        color={{ type: 'SassColor', value: { hex: '#ff5722' } }}
      />
    );
    expect(getByText('primary')).toBeInTheDocument();
  });
});
