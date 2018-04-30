import React from 'react';
import { bool, number, string, oneOfType } from 'prop-types';
import cx from 'classnames';
import styled from 'styled-components';

const propTypes = {
  main: bool,
  shade: oneOfType([number, string]),
  isActive: bool
};

const Swatch = ({ children, shade, isActive, ...other }) => {
  const classes = cx({ 'is-active': isActive });

  return (
    <StyledSwatch className={classes} {...other}>
      <StyledSwatchInfo>{shade}</StyledSwatchInfo>
    </StyledSwatch>
  );
};

const StyledSwatch = styled.button`
  position: relative;
  min-width: ${props => props.theme.spaces.xlarge};
  height: ${props => props.theme.spaces.xlarge};
  padding: ${props => props.theme.spaces.small};
  border-width: 0;
  background-color: ${props => props.color};
  z-index: 0;

  &:focus,
  &:active,
  &.is-active {
    z-index: 1;
    box-shadow: inset 0 0 0 1px ${props => props.theme.colors.black},
      inset 0 0 0 2px ${props => props.theme.colors.white};
  }
`;

const StyledSwatchInfo = styled.span`
  display: inline-block;
  padding: ${props => props.theme.spaces.mini};
  background: ${props => props.theme.colors.white};
  font-size: ${props => props.theme.fontSizes.small};
`;

Swatch.displayName = 'Swatch';
Swatch.propTypes = propTypes;

export default Swatch;
