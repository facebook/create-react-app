import React from 'react';
import './style';

import { ThemeConsumer } from 'styled-components';

import * as theme from './../../style/theme';

import Preview from './Preview';

const ThemedPreview = props => (
  <ThemeConsumer>
    {theme => (
      <Preview
        bgThemeColors={theme?.previewBackgrounds ?? { white: '#fff' }}
        {...props}
      />
    )}
  </ThemeConsumer>
);

ThemedPreview.defaultProps = {
  theme,
};

export default ThemedPreview;
