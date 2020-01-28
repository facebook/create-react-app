import React from 'react';
import { render } from '@testing-library/react';

import Note from '.';

describe('rendering', () => {
  it('Note', () => {
    const { getByText } = render(<Note title="Note title">Note</Note>);
    expect(getByText('Note')).toBeInTheDocument();
  });
});
