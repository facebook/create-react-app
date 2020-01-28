import React from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

import * as defaultTheme from './../../style/theme';

const ThemeProvider = ({ theme = {}, children }) => {
  // merge defaultTheme theme and passed theme
  const mergedTheme = Object.keys(theme).reduce((acc, prop) => {
    if (prop === 'previewBackgrounds') {
      acc[prop] = theme[prop];

      return acc;
    }

    if (typeof theme[prop] === 'object') {
      acc[prop] = {
        ...(theme[prop] || {}),
        ...theme[prop],
      };
    } else {
      acc[prop] = theme[prop];
    }

    return acc;
  }, Object.assign({}, defaultTheme));

  return (
    <StyledThemeProvider theme={mergedTheme}>{children}</StyledThemeProvider>
  );
};

export default ThemeProvider;
