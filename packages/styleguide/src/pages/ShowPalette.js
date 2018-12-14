import React from 'react';
import { ColorPalette } from './../components';

import colors from './../components/ColorPalette/mockScssColorConfig';

const colorValues = colors.global['$color-palette'].value;

export default props => (
  <div>
    {Object.keys(colorValues).map(name => (
      <ColorPalette key={name} color={colorValues[name]} name={name} />
    ))}
  </div>
);
