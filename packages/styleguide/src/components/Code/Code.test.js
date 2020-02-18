import React from 'react';
import { render } from '@testing-library/react';

import Code from '.';
import oneDarkPro from './oneDarkProTheme';

describe('rendering', () => {
  it('Code', () => {
    const { getByText } = render(<Code>Code</Code>);
    expect(getByText('Code')).toBeInTheDocument();
  });

  it('Code renders with default oneDarkPro theme', () => {
    const { getByTestId, debug } = render(<Code data-testid="code">Code</Code>);

    expect(getByTestId('code')).toHaveStyle(
      `background-color: ${oneDarkPro.plain.backgroundColor}`
    );
  });

  it('Code renders with passed theme', () => {
    const theme = {
      plain: {
        backgroundColor: 'rgb(0, 0, 0)',
      },
      styles: [],
    };

    const { getByTestId, debug } = render(
      <Code data-testid="code" theme={theme}>
        Code
      </Code>
    );

    expect(getByTestId('code')).toHaveStyle(
      `background-color: ${theme.plain.backgroundColor}`
    );
  });
});
