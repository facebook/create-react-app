import React from 'react';
import { oneOf } from 'prop-types';
import styled from 'styled-components';
import { rem } from './../../style/utils';

import { colors } from './../../style/theme';

const propTypes = {
  color: oneOf(Object.keys(colors))
};

const Badge = ({ children, color = 'black', ...other }) => (
  <StyledBadge color={color} {...other}>
    {children}
  </StyledBadge>
);

const StyledBadge = styled.span`
  color: ${props => props.theme.colors.white};
  background-color: ${props => props.theme.colors[props.color]};

  padding: ${rem(1)} ${rem(10)} ${rem(2)};

  font-size: ${props => rem(props.theme.fontSizes.small)};
  text-transform: capitalize;
`;

Badge.propTypes = propTypes;

export default Badge;
