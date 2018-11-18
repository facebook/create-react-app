import React from 'react';
import styled from 'styled-components';

import { rem } from './../../style/utils';

/* Styles have to be on the top because of Tag and TagTitle */
const StyledButton = styled.button`
  display: inline-block;
  min-height: ${rem(24)};
  margin-bottom: ${props => props.theme.spaces.small};
  padding: 0 ${props => props.theme.spaces.small};
  vertical-align: middle;
  text-align: center;
  cursor: pointer;
  appearance: none;
  border: 0px solid transparent;
  background: transparent;
  font-family: ${props => props.theme.fontFamily};
  font-weight: ${props => props.theme.fontWeights.bold};
  font-size: ${props => props.theme.fontSizes.small};
  color: ${props => props.theme.colors.black};

  .icon {
    margin-right: 1em;
    margin-top: -2px;
  }
`;

const Button = ({ children, variant, ...other }) => {
  return <StyledButton {...other}>{children}</StyledButton>;
};

Button.displayName = 'Button';

export default Button;
