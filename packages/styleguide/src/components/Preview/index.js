import React from 'react';
import './style';

import { ThemeConsumer } from 'styled-components';

import Preview from './Preview';

const ThemedPreview = props => (
  <ThemeConsumer>
    {theme => <Preview bgThemeColors={theme.previewBackgrounds} {...props} />}
  </ThemeConsumer>
);

export default ThemedPreview;
