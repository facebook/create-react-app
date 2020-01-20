import React from 'react';
import { render } from '@testing-library/react';

import { H1, H2, H3, H4, H5, P, Link } from '.';

const headings = [H1, H2, H3, H4, H5];

describe('rendering', () => {
  test.each(headings)('heading', El => {
    const { getByRole } = render(<El>Heading</El>);
    expect(getByRole('heading')).toBeInTheDocument();
  });

  it('P', () => {
    const { getByText } = render(<P>Paragraph</P>);
    expect(getByText('Paragraph')).toBeInTheDocument();
  });

  it('Link', () => {
    const { getByRole } = render(<Link href="#">Link</Link>);
    expect(getByRole('link')).toBeInTheDocument();
  });
});
