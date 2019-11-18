import React, { useState } from 'react';
import { string, object } from 'prop-types';
import styled from 'styled-components';

import Swatch from './Swatch';

const defaultShade = '500';

const ColorPalette = ({ children, name, color, ...other }) => {
  const [currentShade, setCurrentShade] = useState(getDefaultShade());

  function getSwatches() {
    if (color && color.type === 'SassMap') {
      return color.value;
    }
    return [];
  }

  function getDefaultShade() {
    if (color && color.type === 'SassMap') {
      let shade = defaultShade;
      if (!Object.prototype.hasOwnProperty.call(color.value, defaultShade)) {
        [shade] = Object.keys(color.value);
      }
      return shade;
    }

    return null;
  }

  function getBackroundColor(shade = currentShade) {
    if (shade) {
      return color.value[shade].value.hex;
    }
    return color.value.hex;
  }

  function handleColorChange(e, shade) {
    setCurrentShade(shade);
  }

  const colorSwatches = getSwatches();

  const swatches = Object.entries(colorSwatches).map(([shade]) => (
    <Swatch
      key={shade}
      shade={shade}
      color={getBackroundColor(shade)}
      isActive={shade === currentShade}
      onClick={e => handleColorChange(e, shade)}
    />
  ));

  return (
    <StyledColorPalette
      {...other}
      style={{ backgroundColor: getBackroundColor() }}
    >
      <StyledColorInfo>
        {name}{' '}
        {swatches.length > 0
          ? `${currentShade} ${color.value[currentShade].value.hex}`
          : color.value.hex}
      </StyledColorInfo>

      {swatches.length > 0 && (
        <StyledSwatches>
          <StyledSwatchSpacer />
          {swatches}
          <StyledSwatchSpacer />
        </StyledSwatches>
      )}
    </StyledColorPalette>
  );
};

ColorPalette.displayName = 'ColorPalette';

ColorPalette.propTypes = {
  /** 
   * Color object could have these two shapes:
   * just one color
   * ```js
{
type: 'SassColor',
value: {
  hex: '#ff5722'
}
}
   * ```
   * or multiple shades with shade number as key
   * ```js
{
type: 'SassMap',
value: {
  '300': {
    type: 'SassColor',
    value: {
      hex: '#ff6b6b'
    }
  },
  '500': {
    type: 'SassColor',
    value: {
      hex: '#fa5252'
    }
  }
}
}
   * ```
   * 
   */
  color: object,
  /** Name of the color */
  name: string,
};

export default ColorPalette;

const StyledColorPalette = styled.div`
  position: relative;
  width: 100%;
  margin: 0;
  padding: 150px 0 0;
  list-style-type: none;
  transition: background ease-out 200ms;
  font-family: ${props => props.theme.fontFamily};

  &:last-of-type {
    margin-bottom: ${props => props.theme.spaces.default};
  }
`;

const StyledColorInfo = styled.div`
  position: absolute;
  top: ${props => props.theme.spaces.medium};
  left: ${props => props.theme.spaces.medium};
  background: white;
  padding: ${props => props.theme.spaces.tiny};
`;

const StyledSwatches = styled.div`
  display: flex;
  padding: ${props => props.theme.spaces.large} 0 0 0;
  overflow-x: auto;
  overflow-y: visible;
`;

const StyledSwatchSpacer = styled.div`
  height: 1px;
  flex: 0 0 ${props => props.theme.spaces.medium};
`;
