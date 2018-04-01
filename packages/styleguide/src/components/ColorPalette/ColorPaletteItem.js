import React from 'react';
import { bool, number, string } from 'prop-types';
import cx from 'classnames';
import styled from 'styled-components';

const propTypes = {
  isMain: bool,
  theme: string,
  weight: number
};

const CLASS_ROOT = 'color-palette__item';

const ColorPaletteItem = ({
  className,
  children,
  isMain,
  theme,
  weight,
  ...other
}) => {
  const classes = cx(
    CLASS_ROOT,
    `${CLASS_ROOT}--${theme}-${weight || '500'}`,
    className
  );

  return (
    <StyledItem className={classes} isMain={isMain} {...other}>
      <StyledInfo className="color-palette__info">
        color({theme}
        {weight && `, ${weight}`})
      </StyledInfo>
    </StyledItem>
  );
};

const StyledItem = styled.div`
  width: 100%;
  height: ${props => (props.isMain ? '100px' : 'auto')};
  padding: 15px;
`;

const StyledInfo = styled.span`
  display: inline-block;
  padding: 3px;
  background: ${props => props.theme.colors.white};
`;

ColorPaletteItem.displayName = 'ColorPaletteItem';
ColorPaletteItem.propTypes = propTypes;

export default ColorPaletteItem;
