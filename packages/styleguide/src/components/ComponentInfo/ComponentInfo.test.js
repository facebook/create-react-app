import React from 'react';
import { render } from '@testing-library/react';

import ComponentInfo from '.';

describe('rendering', () => {
  it('ComponentInfo', () => {
    const { getByText } = render(
      <ComponentInfo
        infoTypes={[
          { label: 'My type', values: ['First value', 'Second value'] },
        ]}
      />
    );
    expect(getByText('My type')).toBeInTheDocument();
  });
});
