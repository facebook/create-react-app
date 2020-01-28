import React from 'react';
import { render } from '@testing-library/react';
import styled from 'styled-components';
import { rgbToColorString, parseToRgb } from 'polished';

import { colors } from '../../style/theme';

import ThemeProvider from '.';

const ThemeConsumer = styled.div`
  color: ${props => props.theme.colors.accent};
`;

describe('rendering', () => {
  it('ThemeProvider', () => {
    const { getByText } = render(
      <ThemeProvider>
        <ThemeConsumer>Theme consumer</ThemeConsumer>
      </ThemeProvider>
    );
    expect(getByText('Theme consumer')).toBeInTheDocument();
  });

  it('ThemeProvider provides theme', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <ThemeConsumer data-testid="theme-consumer">
          Theme consumer
        </ThemeConsumer>
      </ThemeProvider>
    );

    const el = getByTestId('theme-consumer');
    const style = window.getComputedStyle(el);

    expect(rgbToColorString(parseToRgb(style.color))).toBe(colors.accent);
  });

  it('ThemeProvider merges passed theme with default theme', () => {
    const color = '#000';

    const { getByTestId } = render(
      <ThemeProvider theme={{ colors: { accent: color } }}>
        <ThemeConsumer data-testid="theme-consumer">
          Theme consumer
        </ThemeConsumer>
      </ThemeProvider>
    );

    const el = getByTestId('theme-consumer');
    const style = window.getComputedStyle(el);

    expect(rgbToColorString(parseToRgb(style.color))).toBe(color);
  });
});
