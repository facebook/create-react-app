import React from 'react';

import { md } from './../utils';
import { ColorPalette, Preview, Card } from './../components';

import scssConfig from './../components/ColorPalette/mockScssColorConfig';

const scssColorPaletteVar = '$color-palette';

const colors = scssConfig.global[scssColorPaletteVar].value;

export default md`
# The quick brown fox jumps over the lazy dog

## The quick brown fox jumps over the lazy dog

### The quick brown fox jumps over the lazy dog

#### The quick brown fox jumps over the lazy dog

##### The quick brown fox jumps over the lazy dog

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## Color palette
${(
  <div>
    <ColorPalette color={colors.primary} name="primary" />
    <ColorPalette color={colors.secondary} name="secondary" />
    <ColorPalette color={colors.error} name="error" />
    <ColorPalette color={colors.success} name="success" />
    <ColorPalette color={colors.grey} name="grey" />
  </div>
)}

${(
  <Preview>
    <Card>
      <h2>Card title</h2>
      <p>
        Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget
        lacinia odio sem nec elit. Donec id elit non mi porta gravida at eget
        metus. Maecenas faucibus mollis interdum. Maecenas faucibus mollis
        interdum. Donec ullamcorper nulla non metus auctor fringilla. Donec sed
        odio dui.
      </p>
    </Card>
  </Preview>
)}
`;
