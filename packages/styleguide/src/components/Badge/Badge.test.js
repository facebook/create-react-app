import React from 'react';
import { render } from '@testing-library/react';

import { Badge, InfoBadge } from '.';

describe('rendering', () => {
  it('Badge', () => {
    const { getByText } = render(<Badge>Badge</Badge>);
    expect(getByText('Badge')).toBeInTheDocument();
  });

  it('InfoBadge', () => {
    const { getByText } = render(<InfoBadge value="ready" />);
    expect(getByText('ready')).toBeInTheDocument();
  });
});
