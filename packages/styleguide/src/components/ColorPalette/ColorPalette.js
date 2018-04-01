import React from 'react';
import { object, array, oneOfType } from 'prop-types';
import cx from 'classnames';
import styled from 'styled-components';

import ColorPaletteItem from './ColorPaletteItem';

const propTypes = {
  colors: oneOfType([object, array])
};

const CLASS_ROOT = 'color-palette';

const ColorPalette = ({ className, children, colors, ...other }) => {
  const classes = cx(CLASS_ROOT, className);
  let ColorPaletteItems;

  if (!Array.isArray(colors)) {
    // if not array, then object according to prop-types
    ColorPaletteItems = Object.entries(colors).map(([colorFragment, values]) =>
      values.map((value, index) => {
        const isMain = index < 1;

        return (
          <ColorPaletteItem
            key={`${isMain ? 1 : 0}-${colorFragment}-${value}`}
            isMain={isMain}
            theme={colorFragment}
            weight={value}
          />
        );
      })
    );
  } else {
    // it's array
    ColorPaletteItems = colors.map(color => (
      <ColorPaletteItem key={color} isMain theme={color} />
    ));
  }

  return (
    <StyledList className={classes} {...other}>
      {ColorPaletteItems}
    </StyledList>
  );
};

const StyledList = styled.div`
  width: 100%;
  margin: 0 0 ${props => props.theme.spaces.medium};
  padding: 0 0 10px;
`;

ColorPalette.displayName = 'ColorPalette';
ColorPalette.propTypes = propTypes;

export default ColorPalette;
